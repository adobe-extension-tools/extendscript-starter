# extendscript-starter

## requirements

- node.js

## install

```shell
git clone git@github.com:adobe-extension-tools/extendscript-starter.git
cd cep-starter
npm install
```

## install "Dev Connect"

To get live reload functionality you first have to install the "Dev Connect" extension that can be found [here](https://github.com/adobe-extension-tools/devconnect/releases)

Download the `.pkg` for macOS or `.exe` for Windows.
If you have trouble installing any of these, download the `.zxp` file and use a third party utility like [ZXPInstaller](http://zxpinstaller.com) to install it.

Now open the application you are building the extension for and open "Dev Connect" by clicking to "Window -> Extensions -> Dev Connect"

## configure

Open the `extendscript-config.js` file in the root of the project and uncomment the configuration for the application you want to target.

## develop

Open the application and load your script, after this, start the bundler:

```shell
npm start
```

Happy coding!

## build only

```shell
npm run build
```

## credits

I have made these tools while working on extensions for [MtMograph](www.mtmograph.com). If you like it, please consider buying one of our extensions for After Effects!