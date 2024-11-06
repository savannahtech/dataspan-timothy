import React from 'react';
import { Slider, Typography, Flex } from 'antd';

const { Title, Text, Paragraph } = Typography;

const generateMarks = (max = 0, min = 0) => {
    const interval = (max - min) / 4;

    return Array
        .from(new Array(5))
        .reduce((acc, _, index) => ({...acc, [min + (interval * index)]: ''}), {})
}

export const RangeFilter = ({ max, min, value = [], onRangeChange }) => {
    return (
        <>
            <Flex justify="space-between">
                <Text>min <Title level={5} style={{  display: 'inline' }}>{min ?? 0}</Title></Text>
                <Paragraph>max <Text className='bold'>{max ?? 0}</Text></Paragraph>
            </Flex>
            <Slider 
                range 
                step={1}
                max={max} 
                marks={generateMarks(max, min)} 
                min={min} 
                value={value}
                defaultValue={[0, 4]}
                onChange={(rangeValue) => onRangeChange?.(rangeValue)}
            />
        </>
    )
}