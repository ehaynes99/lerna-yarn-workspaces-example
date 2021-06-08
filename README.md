# Lerna & yarn workspaces
An example project using yarn workspaces and lerna.

A bit more info about these two in ./docs:
- [lerna](docs/lerna.md)
- [yarn](docs/yarn.md)

This is a walkthrough of how this project was created. The commit history should (mostly) follow the steps in this document.

---
## Local npm registry
For experimentation, you probably don't want to actually publish to npm. You can run a local, private registry in one line using [verdaccio](https://verdaccio.org/en/). When it starts, it will print the location of its default config, and in that yaml file will be a `storage:` key that shows where it is saving your published modules (`~/.local/share/verdaccio/storage` on mac). It will default to running on `http://localhost:4873`, which we will use as the registry in the steps below.

---
## Create the project
```shell
mkdir project-name && cd project-name
yarn init -y
yarn add typescript
mkdir packages
```
* edit `package.json`
  * remove `main` - this is the monorepo root
  * add `"private": true` - we never want to publish the root, only the sub-packages
  * add `"workspaces"` to tell `yarn` where the submodules are located. This accepts a wildcard like `packages/*`, or an explicit list (listing may be preferable to enforce order)
```json
{
  "name": "lerna-yarn-workspaces-example",
  "version": "1.0.0",
  "private": true,
  "license": "UNLICENSED",
  "workspaces": [
    "packages/*"
  ]
}
```

### Initialize lerna
```shell
# -W flag tells yarn we want this dependency for the workspace root
# all dev dependencies should do this from now on
yarn add -D -W lerna
npx lerna init
```

### Edit `lerna.json`
  * tell `lerna` to use `yarn` for packages with `"npmClient": "yarn"`
  * to allow integration with yarn workspaces, add `"useWorkspaces": true`
  * remove the `"packages"` section, because `lerna` will now use the `"workspaces"` value from `package.json`
  * set the private repository to use for publishing (better artifactory).
```shell
{
  "npmClient": "yarn",
  "useWorkspaces": true,
  "version": "1.0.0",
  "command": {
    "publish": {
      "registry": "http://localhost:4873/"
    }
  }
}
```

### Initialize git
Lerna checks git when dealing with versioning (more on this in [Publish](#publish)), so your project will need to be a git repository connected to a remote. Create a new repository on github, then:
```shell
git init .
wget -O .gitignore https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore
git add .
git commit -m"create project"
git remote add origin git@github.com:ehaynes99/lnl-lerna.git
git push -u origin HEAD
```

### Local npm registry
You may have noticed the the `localhost` address for the registry above. 
---
# Create a library package
```shell
mkdir packages/example-utils && cd packages/example-utils
yarn init -y
tsc --init
mkdir src
touch src/index.ts
```
### Update tsconfig.json if desired, e.g.
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2019",
    "lib": ["es2020"],
    "sourceMap": true,
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "moduleResolution": "node"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```
### Update `package.json` with basic typescript values
```json
{
  "name": "@better-tmp/example-utils",
  "version": "1.0.0",
  "license": "UNLICENSED",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc"
  }
}
```
### Add some functionality
```typescript
// packages/example-utils/src/reverse.ts
export const reverse = (str: string) => {
  const result: string[] = [];
  str.split('').forEach((char: string) => result.unshift(char));
  return result.join('');
}
```
```typescript
// src/index.ts
export * from './reverse';
```
---
## Create an application
To keep things simple, the app will just be a node script. Start out by largely repeating the steps for [Create a library package](#create-a-library-package).
```shell
mkdir packages/example-app && cd packages/example-app
yarn init -y
tsc --init
mkdir src
touch src/index.ts
```
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2019",
    "lib": ["es2020"],
    "sourceMap": true,
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "moduleResolution": "node"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```
### Update `package.json`
```json
{
  "name": "@better-tmp/example-app",
  "version": "1.0.0",
  "license": "UNLICENSED",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```
### And add a stub of an application
```typescript
// src/index.ts
console.log('hello world!');
```
**UH OH!**

We now have a compilation error: `Cannot find name 'console'. Do you need to change your target library?...`. To fix this, we need to add a dev dependency for `@types/node`. We can add it here in this package, but then we have to add it in all of the others as well. Instead, let's share the dependency with all of our packages:
```shell
cd ../..
# Remember, -W flag lets us add to the root
yarn add -D -W @types/node
```
Now, if we look back at `./packages/example-app/src/index.ts`, the error is gone. That package doesn't even have a `node_modules` directory yet, but `npm` recursively searches upward for packages and finds the one from the root automagically.

---
## Connect our 2 packages
Now for the fun part. Let's make our test app depend on our test utils. There are a few different ways to do this.
From the root project:
```shell
# with lerna
lerna add @better-tmp/example-utils --scope=@better-tmp/example-app
# ----- OR -----
# with yarn (NOTE: version is required here, which is clumsy)
yarn workspace @better-tmp/example-app add @better-tmp/example-utils@^1.0.0
```
From the package itself
```shell
cd packages/example-app
# NOTE: version is required here, which is clumsy
yarn add @better-tmp/example-utils@^1.0.0
```

Notice that our app directory still doesn't have a `node_modules`. So where is the dependency? Let's look in the project root's `node_modules`. There we see these symlinks.
```
.
├── node_modules
│   ├── @better-tmp
│   │   ├── example-app -> ../../packages/example-app
│   │   └── example-utils -> ../../packages/example-utils
```

---
## See if it works
Let's modify our app:
```typescript
// ./packages/example-app/src/index.ts
import { reverse } from '@better-tmp/example-utils';

console.log(reverse('hello world!'));
```
And now build and run:
```shell
cd packages/example-app
yarn build
yarn start # make sure the `start` script is in package.json like above
```
If all goes as planned, you should see this output:
```shell
$ yarn start
yarn run v1.22.10
$ node dist/index.js
!dlrow olleh
✨  Done in 0.13s.
```

---
## Publish
To publish, simply run:
```shell
lerna publish
```
It will prompt to confirm your desired semver version:
```shell
$ lerna publish
lerna notice cli v4.0.0
lerna info current version 1.0.0
? Select a new version (currently 1.0.0) (Use arrow keys)
❯ Patch (1.0.1) 
  Minor (1.1.0) 
  Major (2.0.0) 
  Prepatch (1.0.1-alpha.0) 
  Preminor (1.1.0-alpha.0) 
  Premajor (2.0.0-alpha.0) 
  Custom Prerelease 
  Custom Version 
lerna info Assuming all packages changed
? Select a new version (currently 1.0.0) Patch (1.0.1)

Changes:
 - @better-tmp/example-app: 1.0.0 => 1.0.1
 - @better-tmp/example-utils: 1.0.0 => 1.0.1

? Are you sure you want to publish these packages? Yes
# ...echoes normal npm publish output for each package
```

After publishing, our repository now has tarballs for each package:
```
.
├── example-app
│   ├── example-app-1.0.1.tgz
│   └── package.json
└── example-utils
    ├── example-utils-1.0.1.tgz
    └── package.json
```
Also note that `lerna` created a commit for the release, and updated the version in `lerna.json` and all of the `package.json` files.

---
## Publish updates
Let's make a change to our utils' `reverse` function:
```typescript
// packages/example-utils/src/reverse.ts
export const reverse = (str: string) => {
  const result: string[] = [];
  str.split('').forEach((char: string) => result.unshift(char));
  return result.join('') + '*******';
}
```

And commit the change:
```shell
git add .
git commit -m"Add some junk to the end of reverse"
lerna publish
```
After similar prompts to the above, the new versions will be published, and our repository will now have:
```
.
├── example-app
│   ├── example-app-1.0.1.tgz
│   ├── example-app-1.0.2.tgz
│   └── package.json
└── example-utils
    ├── example-utils-1.0.1.tgz
    ├── example-utils-1.0.2.tgz
    └── package.json
```

---
## Independent Versioning
You may have noticed that we only had one choice for the version number of both modules. Whether this is desirable or not is a matter of preference. Let's separate them. In `lerna.json`, change the `"version"` attribute to `"independent"`
```diff
diff --git a/lerna.json b/lerna.json
index b47f588..b08a2b1 100644
--- a/lerna.json
+++ b/lerna.json
@@ -1,7 +1,7 @@
 {
   "npmClient": "yarn",
   "useWorkspaces": true,
-  "version": "1.0.2",
+  "version": "independent",
```

Now, when we run `lerna publish`, it will prompt for the version of each changed package individually. Those without changes will be ignored, but note that `lerna` will automatically update the `package.json` of packages that depend on other changed packages.

```shell
$ lerna publish
lerna notice cli v4.0.0
lerna info versioning independent
lerna info Looking for changed packages since v1.0.2
? Select a new version for @better-tmp/example-app (currently 1
.0.2) (Use arrow keys)
❯ Patch (1.0.3) 
  Minor (1.1.0) 
  Major (2.0.0) 
  Prepatch (1.0.3-alpha.0) 
  Preminor (1.1.0-alpha.0) 
  Premajor (2.0.0-alpha.0) 
  Custom Prerelease 
  Custom Version 
```