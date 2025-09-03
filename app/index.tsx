import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '@/context/AuthContext'


const index = () => {

    const router = useRouter()
    const { user, loading } = useAuth()
    console.log("User Data:", user)

    useEffect(() => {
      if(!loading){
        if(user) router.replace("/home")
        else router.replace("/login")
      }
    },[user, loading])

    if(loading){
      return (
        <View className='flex-1 w-full justify-center align-items-center'>
          <ActivityIndicator size="large"/>
        </View>
      )
    }

  return (
    <View className='flex-1 w-full justify-center align-items-center'>
      <Text className='text-4xl'>index</Text>
      <TouchableOpacity 
      onPress={() => router.push("/login")}
      className="bg-blue-500 px-6 py-6"
      >
       <Text className='text-4xl'>Go</Text> 
      </TouchableOpacity>
    </View>
  )
}

export default index