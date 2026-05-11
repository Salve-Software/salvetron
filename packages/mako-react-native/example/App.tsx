import React, { useEffect } from 'react'
import { Text, View, StyleSheet, Button } from 'react-native'
import mako from 'mako-react-native'

const streamingPlatform = {
  id: 'platform_001',
  name: 'NebulaStream',
  version: '2.4.1',
  environment: 'production',

  features: {
    offlineMode: true,
    liveStreaming: true,
    recommendations: true,
    parentalControl: false,
    subtitles: {
      enabled: true,
      supportedLanguages: ['pt-BR', 'en-US', 'es-ES', 'fr-FR'],
    },
  },

  metrics: {
    activeUsers: 182341,
    monthlyRevenue: 91234.55,
    watchTimeHours: 1283912,
    crashRate: 0.021,
    averageSessionMinutes: 47,
  },

  users: [
    {
      id: 'user_001',
      name: 'Gabriel',
      username: 'gabsdev',
      email: 'gabriel@example.com',
      verified: true,
      roles: ['admin', 'developer'],
      preferences: {
        theme: 'dark',
        autoplay: true,
        language: 'pt-BR',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
      },
      devices: [
        {
          id: 'device_iphone',
          type: 'mobile',
          os: 'iOS',
          version: '18.0',
          lastLogin: '2026-05-08T12:22:10Z',
        },
        {
          id: 'device_macbook',
          type: 'desktop',
          os: 'macOS',
          version: '15.1',
          lastLogin: '2026-05-08T13:11:02Z',
        },
      ],
      stats: {
        followers: 1203,
        following: 210,
        uploadedVideos: 42,
        totalViews: 918221,
      },
    },

    {
      id: 'user_002',
      name: 'Marina',
      username: 'marinacuts',
      email: 'marina@example.com',
      verified: false,
      roles: ['editor'],
      preferences: {
        theme: 'light',
        autoplay: false,
        language: 'en-US',
        notifications: {
          email: true,
          push: false,
          sms: false,
        },
      },
      devices: [
        {
          id: 'device_android',
          type: 'mobile',
          os: 'Android',
          version: '15',
          lastLogin: '2026-05-07T21:11:55Z',
        },
      ],
      stats: {
        followers: 821,
        following: 95,
        uploadedVideos: 11,
        totalViews: 18211,
      },
    },
  ],

  videos: [
    {
      id: 'video_001',
      title: 'Building a React Native Video Engine',
      category: 'Technology',
      durationSeconds: 1840,
      publishedAt: '2026-04-28T18:00:00Z',
      tags: ['react-native', 'c++', 'video-streaming', 'performance'],
      authorId: 'user_001',
      engagement: {
        likes: 12811,
        dislikes: 112,
        comments: 1821,
        shares: 441,
      },
      qualityOptions: [
        {
          label: '360p',
          bitrate: 800000,
        },
        {
          label: '720p',
          bitrate: 2500000,
        },
        {
          label: '1080p',
          bitrate: 5000000,
        },
      ],
    },

    {
      id: 'video_002',
      title: 'SwiftUI Animations for macOS',
      category: 'Development',
      durationSeconds: 940,
      publishedAt: '2026-03-11T10:30:00Z',
      tags: ['swiftui', 'macos', 'animations'],
      authorId: 'user_002',
      engagement: {
        likes: 2811,
        dislikes: 14,
        comments: 201,
        shares: 52,
      },
      qualityOptions: [
        {
          label: '720p',
          bitrate: 2200000,
        },
        {
          label: '4K',
          bitrate: 12000000,
        },
      ],
    },
  ],

  servers: [
    {
      id: 'srv_br_01',
      region: 'south-america',
      location: {
        country: 'Brazil',
        city: 'São Paulo',
        latitude: -23.55052,
        longitude: -46.633308,
      },
      specs: {
        cpu: 'AMD EPYC 9654',
        ramGb: 256,
        storageTb: 40,
        bandwidthGbps: 10,
      },
      status: 'online',
      uptimeHours: 2211,
    },

    {
      id: 'srv_us_01',
      region: 'north-america',
      location: {
        country: 'United States',
        city: 'Dallas',
        latitude: 32.7767,
        longitude: -96.797,
      },
      specs: {
        cpu: 'Intel Xeon Platinum',
        ramGb: 512,
        storageTb: 80,
        bandwidthGbps: 40,
      },
      status: 'maintenance',
      uptimeHours: 9112,
    },
  ],

  analytics: {
    topCountries: [
      {
        country: 'Brazil',
        users: 91231,
      },
      {
        country: 'United States',
        users: 42111,
      },
      {
        country: 'Germany',
        users: 11821,
      },
    ],

    peakHours: [
      {
        hour: '18:00',
        concurrentUsers: 18211,
      },
      {
        hour: '21:00',
        concurrentUsers: 24112,
      },
    ],

    deviceDistribution: {
      mobile: 62,
      desktop: 28,
      tablet: 10,
    },
  },

  security: {
    jwtExpirationMinutes: 120,
    refreshTokenDays: 30,
    allowedOrigins: [
      'https://app.nebulastream.com',
      'https://studio.nebulastream.com',
    ],
    rateLimit: {
      requestsPerMinute: 120,
      burst: 40,
    },
  },
}
function App(): React.JSX.Element {
  useEffect(() => {
    if (__DEV__) {
      mako.connect({ host: '192.168.0.2' })
      setTimeout(() => {
        mako.log('FIRST-LOG')
      }, 2000)
    }
  }, [])
  return (
    <View style={styles.container}>
      <Text style={styles.text}></Text>
      <Button
        title="Test"
        onPress={() => {
          fetch('https://jsonplaceholder.typicode.com/todos/1')
            .then(response => response.json())
            .then(json => mako.log('RESPONSE-API', streamingPlatform))
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 40,
    color: 'green',
  },
})

export default App
