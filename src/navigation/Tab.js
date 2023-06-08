import React from 'react'
import { Dimensions, Image, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Essence from '../views/Essence'
import RecipeProduced from '../views/RecipeProduced'
import Recipe from '../views/Recipe'
import BarChartWhite from '../assets/tabIcon/barchart-branco.svg'
import BarChartOrange from '../assets/tabIcon/barchart-laranja.svg'
import EssenceOrange from '../assets/tabIcon/essencia-laranja.svg'
import EssenceWhite from '../assets/tabIcon/essencia-branco.svg'
import BerriesWhite from '../assets/tabIcon/berries-branco.svg'
import BerriesOrange from '../assets/tabIcon/berries-laranja.svg'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import estilo from '../estilo'
import { RFValue } from 'react-native-responsive-fontsize'

const Tabs = createBottomTabNavigator()

export default props => {

    return (
        <Tabs.Navigator {...props}
            initialRouteName={'RecipeProduced'}
            screenOptions={{
                tabBarHideOnKeyboard: true,
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    left: 5,
                    backgroundColor: '#1B2040',
                    borderTopWidth: 0,
                    borderRadius: 15,
                    height: Dimensions.get('window').height * 0.1,
                    alignSelf: 'center',
                    marginHorizontal: Dimensions.get('window').width * 0.1,
                },
            }}>
            <Tabs.Screen
                name='Essence'
                component={Essence}
                options={{
                    tabBarIcon: ({ focused, size, color }) => (                       
                        focused ? <BerriesOrange width={RFValue(45)} height={RFValue(45)} />
                            : < BerriesWhite width={RFValue(35)} height={RFValue(35)} />
                    )
                }}

            />
            <Tabs.Screen
                name='Recipe'
                component={Recipe}
                options={{
                    tabBarIcon: ({ focused, size, color }) => (                       
                        focused ? <EssenceOrange width={RFValue(45)} height={RFValue(45)} />
                            : < EssenceWhite width={RFValue(35)} height={RFValue(35)} />
                    )
                }}
            />
            <Tabs.Screen
                name='RecipeProduced'
                component={RecipeProduced}
                options={{
                    tabBarIcon: ({ focused, size, color }) => (                       
                        focused ? <BarChartOrange width={RFValue(45)} height={RFValue(45)} />
                            : < BarChartWhite width={RFValue(35)} height={RFValue(35)} />
                    )
                }}
            />
        </Tabs.Navigator>
    )
}

const styles = StyleSheet.create({
    imageIcon: {
        width: 45,
        height: 45,
    },
    imageIcon2: {
        width: 35,
        height: 35,
    }
})