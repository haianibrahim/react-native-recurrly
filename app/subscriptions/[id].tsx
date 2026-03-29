import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams, Link } from 'expo-router'

const SubscriptionDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <View>
            <Text>SubscriptionDetails: {id}</Text>
            <Link href="./">Go back</Link>
        </View>
    )
}

export default SubscriptionDetails