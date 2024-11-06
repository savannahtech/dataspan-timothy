import { Card, Row, Col, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { KonvaImage } from './KonvaImage';

const { Text } = Typography

export const ImageGrid = ({ images, onClick }) => {
    const ref = useRef(null);
    const [imageWidth, setImageWidth] = useState(null);

    useEffect(() => {
      const resizeObserver = new ResizeObserver(() => {

        const colElement = ref.current?.children?.[0]
          // Get the width of the observed element
          const newWidth = colElement?.getBoundingClientRect().width;
          if (colElement) {
            const { paddingLeft, paddingRight } = window.getComputedStyle(colElement)
            setImageWidth(newWidth - parseInt(paddingLeft, 10) - parseInt(paddingRight, 10)); // Update the state with the new width
          }
      });
  
      if (ref.current) {
        resizeObserver.observe(ref.current); 
      }
  
      // Cleanup on component unmount
      return () => {
        if (ref.current) {
          resizeObserver.unobserve(ref.current);
        }
      };
    }, []);

    return (
      <Row gutter={[32, 32]} ref={ref}>
        {images.map((image) => (
          <Col key={image.photoUrl} xs={12} sm={8} md={6} lg={4} xxl={3}>
              {imageWidth && <Card
                  hoverable
                  onClick={() => onClick(image)}
                  cover={<KonvaImage image={image} imageWidth={imageWidth} imageHeight={imageWidth} isPreview/>}
                  style={{ boxShadow: 'none' }}
              >
                  <Text ellipsis={{ tooltip: image.photoName }}>{image.photoName}</Text>
              </Card>}
          </Col>
        ))}
      </Row>
    )
};
  