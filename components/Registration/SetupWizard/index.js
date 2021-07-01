import React, {useState, useEffect, useContext} from 'react'

import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import {useHistory} from 'react-router-native'

import * as Keychain from 'react-native-keychain'

import AppHeaderLarge from '../../AppHeaderLarge/index.js'
import BackButton from '../../BackButton/index.js'
import LoadingOverlay from '../../LoadingOverlay/index.js'
import Message from '../../Message/index.js'

import AppStyles from '@assets/styles'
import Images from '@assets/images'
import Styles from './styles'

import {NotificationsContext} from '../../Notifications/index.js'

function SetupWizard(props) {
  let history = useHistory()

  const notifications = useContext(NotificationsContext)

  const [nextActive, setNextActive] = useState(false)

  const [setupScreens, setSetupScreens] = useState(-1)

  useEffect(() => {
    //check number in keychain, setSetupScreens
    const storeWizard = async () => {
      let checker = await Keychain.getGenericPassword({service: 'setupWizard'})
      const currentScreen = '0'
      const setupComplete = 'false'
      if (!checker) {
        await Keychain.setGenericPassword(currentScreen, setupComplete, {
          service: 'setupWizard',
        })
        setSetupScreens(0)
      } else {
        setSetupScreens(parseInt(checker.username, 10))
      }
      checker = await Keychain.getGenericPassword({service: 'setupWizard'})
    }
    storeWizard()
  }, [])

  useEffect(() => {
    const wizardUpdate = async () => {
      let setupComplete = 'false'
      let currentScreen = setupScreens.toString()
      if (setupScreens >= props.children.length) {
        props.setAuthenticated(true)
        setupComplete = 'true'
        history.push('/home')
      }
      await Keychain.resetGenericPassword({service: 'setupWizard'})
      await Keychain.setGenericPassword(currentScreen, setupComplete, {
        service: 'setupWizard',
      })
      let checker = await Keychain.getGenericPassword({service: 'setupWizard'})

      /*
      Is the setup complete? Set setupComplete to true or false
      Update keychain with  
      */
    }
    wizardUpdate()
  }, [setupScreens])

  return (
    <>
      <BackButton backExit={true} />
      {setupScreens < 0 ? (
        <LoadingOverlay />
      ) : (
        <>
          {setupScreens >= props.children.length ? (
            <LoadingOverlay />
          ) : (
            <>
              <View style={AppStyles.windowFull}>
                <KeyboardAvoidingView
                  behavior={'height'}
                  style={{height: '92%', minHeight: '80%'}}>
                  {React.cloneElement(props.children[setupScreens], {
                    setupScreens: setupScreens,
                    setSetupScreens: setSetupScreens,
                  })}
                </KeyboardAvoidingView>
                <View style={Styles.dotContainer}>
                  {props.children.map((child, index) => {
                    let dotStyle = [Styles.dot]
                    if (index <= setupScreens) {
                      dotStyle.push(Styles.dotFilled)
                    }

                    // Logic to manage dots
                    // Ensure only five are on screen at a time
                    // Give indications of overflow on either side with small dots

                    // Determining how many full-sized dots should surround the current dot
                    let y
                    if (
                      setupScreens == 0 ||
                      setupScreens == props.children.length - 1
                    ) {
                      y = 4
                    } else if (
                      setupScreens == 1 ||
                      setupScreens == props.children.length - 2
                    ) {
                      y = 3
                    } else {
                      y = 2
                    }

                    // Making the dot at the edge small, then hiding each dot beyond that
                    if (
                      setupScreens + y == index ||
                      index == setupScreens - y
                    ) {
                      // Only make the dot small if it's not at the very end or beginning
                      if (index != 0 && index != props.children.length - 1) {
                        dotStyle.push(Styles.dotSmall)
                      }
                    } else if (
                      setupScreens + y < index ||
                      index < setupScreens - y
                    ) {
                      dotStyle.push(Styles.dotHidden)
                    }

                    return <View key={index} style={dotStyle} />
                  })}
                </View>
              </View>
            </>
          )}
        </>
      )}
    </>
  )
}

export default SetupWizard
