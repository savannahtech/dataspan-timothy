import React, { useEffect, useMemo, useState } from 'react';
import { Flex, Layout, Typography, Image, Pagination } from 'antd';
import './App.css';
import { ChipFilter } from './components/ChipFilter';
import { RangeFilter } from './components/RangeFIlter';
import { BoneGallery, TabValues } from './components/BoneGallery';
import { fetchS3Albums } from './utilities/fetchS3Images';
import { ClearFilter } from './components/ClearFilter';

const { Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;

const PAGE_SIZE = 50

function App() {
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState({});
  const [rangeFilterValue, setRangeFilterValue] = useState([0,4]);
  const [classFilterValue, setClassFilterValue] = useState([]);
  const [{ allImages, displayedImages }, setImageMetadata] = useState({ allImages: [], displayedImages: []});
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState(TabValues.ALL_GROUPS.value);

  useEffect(() => {
    const selectedTabImages = currentTab === TabValues.ALL_GROUPS.value
      ? [...(folders.value ?? []), ...(folders.train ?? []), ...(folders.test ?? [])]
      : folders[currentTab]

    const displayedImages = selectedTabImages.filter(
        ({ classes }) => 
          (classes?.some((classValue) => classFilterValue.includes(classValue) ) || !classFilterValue?.length)
          && classes.length >= rangeFilterValue?.[0] && classes.length <= rangeFilterValue?.[1]
      )

      setImageMetadata({ allImages: selectedTabImages, displayedImages })
      setCurrentPage(1)
  }, [folders, currentTab, classFilterValue, rangeFilterValue])

  const paginatedImages = useMemo(() => {
    return displayedImages?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) ?? []
  }, [displayedImages, currentPage])

  const fetchAlbums = async () => {
    setLoading(true);
    const albums = await fetchS3Albums()
    setFolders(albums?.[0]?.folders)
    setLoading(false);
  }

  const onResetFilter = () => {
    setClassFilterValue([])
    setRangeFilterValue([0,4])
  }

  useEffect(() => {
    fetchAlbums();
    alert('Spent 12 hours working on it.')
  }, [])

  return (
    <Layout style={{ padding: '25px 32px'}}>
      <Sider width={330} className="sider">
        <Image src='/images/Logo.svg' preview={false} style={{ objectFit: 'contain' }}/>
        <Title level={5} style={{ marginBottom: 4 }}>Classes Filter</Title>
        <ChipFilter 
          chipValues={folders?.classList} 
          onFilterChange={(selectedClasses) => setClassFilterValue(selectedClasses)} 
          value={classFilterValue}
        />
        <Title level={5}>Polygon Range</Title>
        <RangeFilter 
          onRangeChange={(rangeValue) => setRangeFilterValue(rangeValue)} 
          min={0} 
          max={4} 
          value={rangeFilterValue}
        />
        <ClearFilter onClick={onResetFilter}/>
      </Sider>
      <Content className="content">
        <Flex justify="space-between" align="center" style={{ marginBottom: 26 }}>
          <Title style={{ margin: 0 }} level={3}>Bone-Fraction-Detection</Title>
          <Paragraph style={{ fontSize: 18, margin: 0 }}>
            <Text className='semi-bold'>{displayedImages.length}</Text> of 
            {' '}<Text className='semi-bold'>{allImages.length}</Text> images
          </Paragraph>
        </Flex>
        <BoneGallery 
          images={paginatedImages} 
          isLoading={loading}
          onTabChange={(tab) => setCurrentTab(tab)}
        />
        <Flex justify="center" style={{ marginTop: 10 }}>
          <Pagination 
            size="small" 
            pageSize={PAGE_SIZE} 
            current={currentPage} 
            onChange={(page) => setCurrentPage(page)} 
            total={displayedImages.length} 
          />
        </Flex>
      </Content>
    </Layout>
  );
}

export default App