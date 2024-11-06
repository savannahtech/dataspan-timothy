import AWS from 'aws-sdk';
import { parseCoordinates } from './parseCordinates';

const albumBucketName = "dataspan.frontend-home-assignment";

AWS.config.region = "eu-central-1"; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: "eu-central-1:31ebe2ab-fc9d-4a2c-96a9-9dee9a9db8b9",
});

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName },
});


// Splitting label call batch call size to limit the CPU & memory usage.
const LABEL_SPLIT_SIZE = 10;

export const fetchS3Data = (key) => {
    return new Promise((resolve, reject) => {
        s3.getObject({ Key: key }, (err, data) => {
            if (err) {
                reject(new Error(`Error fetching label content: ${err.message}`));
            } else {
                resolve(data.Body.toString('utf-8'));
            }
        });
    });
}

export const fetchPhotosForEachGroup = async (groupPhotosKey, classList) => {
    const [ images, thumbnails, labels ] = await Promise.all([
        s3.listObjects({ Prefix: `${groupPhotosKey}images/`, MaxKeys: 200 }).promise(),
        s3.listObjects({ Prefix: `${groupPhotosKey}thumbnails/`, MaxKeys: 200 }).promise(),
        s3.listObjects({ Prefix: `${groupPhotosKey}labels/` }).promise()
    ])

    const transformedImage = []

    for (let index = 0; index < (images?.Contents ?? []).length; index++)  {
        const image = images?.Contents?.[index] ?? {};
        const  photoKey = image.Key;
        const thumbnail = thumbnails?.Contents?.[index] ?? {}
        const label = labels?.Contents?.[index]?? {}

        const baseURL = `https://s3.${AWS.config.region}.amazonaws.com/${albumBucketName}/`

        transformedImage.push({
            photoKey,
            photoUrl: baseURL + encodeURIComponent(photoKey),
            photoName: photoKey.split('/').at(-1),
            thumbnailKey:  thumbnail.Key,
            thumbnailUrl: baseURL + encodeURIComponent(thumbnail.Key),
            labelUrl: baseURL + encodeURIComponent(label.Key),
            labelKey: label.Key,
            labelData: null,
        })
    }

    const totalLabelCount = transformedImage.length;
    const batchCount = Math.ceil(totalLabelCount / LABEL_SPLIT_SIZE);
    const imageBatches = Array.from({ length: batchCount }, (_, index) => {
        const startIndex = index * LABEL_SPLIT_SIZE;
        const endIndex = Math.min((index + 1) * LABEL_SPLIT_SIZE, totalLabelCount);
        return transformedImage.slice(startIndex, endIndex);
    })

    const allLabelResponses = [];

    for (let batch of imageBatches) {
        const labelResponse = await Promise.all(batch.map(async ({ labelKey }) => await fetchS3Data(labelKey)))
        allLabelResponses.push(...labelResponse)
    }

    return transformedImage
        ?.map((imageMeta, index) => {
            const labelPayload = allLabelResponses[index]
            const classes = [];
        
            const coords = labelPayload
                .split('\n')
                .filter((polygon) => polygon)
                .map((polygon) => {
                    const [classNum, ...coords] = polygon.trim().split(' ');
                    classes.push(classList[Number(classNum)])
                
                    return parseCoordinates(coords)
                })

            return {
                ...imageMeta,
                classes,
                coords
            }
        })
        .sort((a, b) => Number(a.photoName > b.photoName))
}

const fetchClassList = async (albumPhotosKey) => {
    const response = await fetchS3Data(`${albumPhotosKey}data.yaml`)

    const classNames = response.split('\n').find(value => value.startsWith('names: '));
    return Array.from(classNames.match(/'[a-z\s]+'/g)).map(value => value.replaceAll("'", ''))
}

export const fetchS3Photos = async (albumPhotosKey) => {
    const classList = await fetchClassList(albumPhotosKey);
    const groupImages = await Promise.all(['train', 'valid', 'test'].map(
        async (group) => await fetchPhotosForEachGroup(`${albumPhotosKey}${group}/`, classList)
    ))
    
    return {
        classList,
        train: groupImages[0],
        test: groupImages[1],
        value: groupImages[2]
    }
}

export const fetchS3Albums = () => {
    return new Promise((resolve, reject) => {
      s3.listObjectsV2({ Delimiter: "/" }, (err, data) => {
        if (err) {
            reject(new Error(`Could not fetch your album from S3: ${err.message}`));
        } else {
            const imageUrls = data.CommonPrefixes.map(function (commonPrefix) {
                const prefix = commonPrefix.Prefix
                const albumName = decodeURIComponent(prefix.replace("/", ""))

                const albumPhotosKey = encodeURIComponent(albumName) + "/";

                return {
                    prefix,
                    albumName,
                    albumPhotosKey
                }
            });

            Promise.all(
                imageUrls.map(async ({ albumPhotosKey }) => await fetchS3Photos(albumPhotosKey))
            ).then((responses) => {
                resolve(imageUrls.map((values, index) => ({ ...values, folders: responses[index] })));
            })
        }
      });
    });
};
