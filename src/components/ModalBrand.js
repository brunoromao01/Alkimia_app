import React from 'react'
import { Text, View, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { RFValue } from "react-native-responsive-fontsize"

export default ({ item }) => {
    return (
        <View>
            <TouchableWithoutFeedback>
                <View style={{ height: RFValue(50), borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text>{item.name}</Text>
                </View>
            </TouchableWithoutFeedback>


        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})