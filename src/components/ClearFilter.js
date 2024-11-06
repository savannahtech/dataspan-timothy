import { Button, Flex, Typography } from "antd"
import { Trash } from "../svgs/Trash"

const { Text } = Typography

export const ClearFilter =  ({ onClick }) => {
    return (
        <Flex align="center" justify="space-between">
            <Button onClick={onClick} icon={<Trash style={{ width: 15 }} />}>Clear Filters</Button>
            <Text>Need Help?</Text>
        </Flex>
    )
}