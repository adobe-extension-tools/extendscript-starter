# Starter Kit for ExtendScript + ScriptUI extensions

This is a "starter kit" for developing ExtendScript + ScriptUI extensions for Adobe applications.
It relies on `extendscript-bundler` and `devconnect` to do the heavy lifting.

The `extendscript-bundler` does a couple of things to make your life easier:

- Compile your [TypeScript](http://www.typescriptlang.org) code into a single `.js` file
- "Live Reloads" the code whenever you save a file for instant updates while developing

For a more detailed explaination, see [under the hood](#under-the-hood)

# Topics

- [Requirements](#requirements)
- [Installing](#installing)
- [Developing](#developing)
- [Under the hood](#under-the-hood)


# Requirements

- node.js

# Installing

```shell
git clone git@github.com:adobe-extension-tools/extendscript-starter.git
cd cep-starter
npm install
```

## Install "Dev Connect"

To get live reload functionality you first have to install the "Dev Connect" extension that can be found [here](https://github.com/adobe-extension-tools/devconnect/releases)

Download the `.pkg` for macOS or `.exe` for Windows.
If you have trouble installing any of these, download the `.zxp` file and use a third party utility like [ZXPInstaller](http://zxpinstaller.com) to install it.

Now open the application you are building the extension for and open "Dev Connect" by clicking to "Window -> Extensions -> Dev Connect"

## Configure

Open the `extendscript-config.js` file in the root of the project and uncomment the configuration for the application you want to target.

# Developing

Open the application and load your script, after this, start the bundler:

```shell
npm start
```

Happy coding!

## Build only

```shell
npm run build
```

# Under the hood

When you run `npm start` a TypeScript compiler takes your `.ts` files and turns them into `.js` files.  
Then [browserify](https://github.com/browserify/browserify) takes over and packs the `.js` files together.
A couple of [transforms](https://github.com/browserify/browserify#btransformtr-opts) to replace environment variables at build time and prepend the following line of code to the bundle `var globalThis = this;`.  
This allows you to access the "this" from the root scope, which will be needed to find an existing panel instance.
Lastly, the bundle is sent to the `Dev Connect` extension that should be running in the application you are writing the extension for, which will in turn evaluate the bundle in the ExtendScript environment (Live Reload!)

# Credits

I have made these tools while working on extensions for [MtMograph](www.mtmograph.com). If you like it, please consider buying one of our extensions for After Effects!