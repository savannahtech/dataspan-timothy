import React from 'react';
import { Flex, Tag, Button } from 'antd';
import { Colors } from '../constants/colors';
import { Ellipse } from '../svgs/Ellipse';

const FilterButton = ({onClick,  text, disabled}) => {
    return (
        <Button 
            onClick={onClick} 
            color="primary" 
            variant="text"
            disabled={disabled}
            style={{ padding: 0 }}
        >
            {text}
        </Button>
    )
}

const classColors = [
    Colors.BLUE ,
    Colors.GOLDENYELLOW,
    Colors.SEA,
    Colors.LIME,
    Colors.ORANGE,
    Colors.PURPLE,
    Colors.RED,
]

export const ChipFilter  = ({ chipValues, onFilterChange, value }) => {
    const [selectedTags, setSelectedTags] = React.useState([]);

    const handleChange = (tag, checked) => {
      setSelectedTags(checked? [...selectedTags, tag] : selectedTags.filter(t => t!== tag));
    };

    React.useEffect(() => {
        if (JSON.stringify(selectedTags) !== JSON.stringify(value)) {
            setSelectedTags(value?? []);
        }
    }, [value])

    React.useEffect(() => {
        // Call the parent component's onFilterChange function with the selected tags.
        onFilterChange?.(selectedTags);  
    }, [selectedTags])

    return (
        <Flex vertical>
            <Flex gap={17} style={{ marginBottom: 11}}>
                <FilterButton
                    onClick={() => setSelectedTags(chipValues?.map((value) => value))}  
                    text="Select all" 
                    disabled={selectedTags.length === (chipValues?.length ?? 0) }
                />
                <FilterButton 
                    onClick={() => setSelectedTags([])} 
                    text="Deselect all"
                    disabled={!selectedTags.length}
                />
            </Flex>
            <Flex gap={9} wrap align="center">
                {chipValues?.map((value, index) => {
                    const isSelected = selectedTags.includes(value);
                    const color = classColors[index]

                    return (<Tag.CheckableTag
                        color={color}
                        key={value}
                        style={{ borderColor: color, color: Colors.TEXT, ...(isSelected && { backgroundColor: `${color}45`}) }}
                        checked={isSelected}
                        onChange={(checked) => handleChange(value, checked)}
                    >
                        <Ellipse width={8} style={{ color, marginRight: 8 }} /> <span>{value}</span>
                    </Tag.CheckableTag>)
                })}
            </Flex>
        </Flex>
    )
}