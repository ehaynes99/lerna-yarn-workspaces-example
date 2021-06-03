# Yarn
Facebook created `yarn` to act as a replacement for `npm` that solved a number of issues. It continues to be out in front of `npm` for new features, many of which eventually end up in `npm` as well. A few such features:
* Caching: initially, `npm install` was slow because it re-downloaded every single package, and `yarn` addressed this by adding a cache.
* Lockfiles: installing dependencies at different times could end up with different versions. E.g. a new version is released between when you installed on a dev machine and when CI did it. `yarn` first introduced lockfiles in the form of `yarn.lock`.
* Workspaces: many projects are broken up into separate but related pieces, and managing their dependencies is tricky.


### Switching to yarn
`yarn` acts as a full replacement for `npm`. It's important to use one or the other, because their lockfiles are different. A comprehensive list of differences can be found here: https://classic.yarnpkg.com/en/docs/migrating-from-npm

Here are a few highlights
* lockfiles
  * `npm` uses `package-lock.json`
  * `yarn` uses `yarn.lock`
* commands

| npm | yarn |
| ----------- | ----------- |
| `npm install` | `yarn` |
| `npm install [packages]` | `yarn add [packages]` |
| `npm install --save-dev [packages]` | `yarn add --dev [packages]` |
| `npm install -D [packages]` | `yarn add -D [packages]` |
| `npm run some-script` | `yarn some-script` |

#### TIP for shell
To remind you to use yarn instead of npm, you can add shell aliases to your .bashrc/.zshrc such as:
```shell
alias npm='echo !!!! Use yarn'
```
Now, when force of habit makes you use `npm`, it will yell at you. To use the real command instead of the alias, you can prefix the command with a `\`
```shell
$ npm -v
!!!! Use yarn -v

$ \npm -v
7.15.1
```