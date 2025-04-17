module.exports = {
  packagerConfig: {
    asar: true,
    icon: './public/icon',
    extraResource: [
      './production.db'
    ],
    osxSign: {
      identity: 'Developer ID Application: Regina Foo (XXXXXXXXXX)',
      'hardened-runtime': true,
      entitlements: 'entitlements.plist',
      'entitlements-inherit': 'entitlements.plist',
      'signature-flags': 'library'
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-fuses',
      config: {
        version: 1,
        fuses: {
          // Disables the Node.js integration in the packaged app
          jsc: {
            electron: {
              nodeIntegration: false,
              contextIsolation: true
            }
          }
        }
      }
    }
  ],
}; 