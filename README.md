# extendscript-starter

## requirements

- node.js

## install

**Note: the types for adobe are added as a submodule, you have to clone recursively as shown below**
This is done so you can easily create a pull request for improvements you might make to them.

```shell
git clone --recursive git@github.com:adobe-extension-tools/extendscript-starter.git
cd cep-starter
npm install
```

## configure

Open the `extendscript-config.js` file in the root of the project and point the `app` property to your Adobe application you are writing the extension for, also update the `dest` property to the location where the resulting .jsx file should be put.

## develop

```shell
npm start
```

Now open the program and load the extension!

## build only

```shell
npm run build
```

## credits

I have made these tools while working on extensions for [MtMograph](www.mtmograph.com). If you like it, please consider buying one of our extensions for After Effects!