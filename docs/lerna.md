# Lerna
A monorepo is simply a single project (repository) that contains multiple independent but related packages. This structure has advantages in that it enforces separation of concerns. However, it's difficult to work with locally when packages depend on each other, as well as inherently containing a lot of duplication.

`lerna` is a tool for managing monorepos. This includes support for linking packages together in the dev environment, allowing for common dev tooling, and easing publishing of modules.

Initially, `lerna` handled a lot of the dependency installation and linking by wrapping around `npm` or `yarn` commands. However, since then, these tools have added some native support for this as well.

**This doesn't mean that they're competing; they work quite well together!**

## Versioning Strategies
Lerna can manage versions in 2 ways:
* Fixed - All packages will be locked to the same version, specified in `lerna.json`
* Independent - Each package will have its own version as specified in `package.json`

---
## Batch Operations
`lerna` has 2 commands that help reduce redundancy. These are particularly useful for adding as `"scripts"` in the root `package.json` that can perform operations on all (or a subset of) the packages.
#### `lerna exec`
See https://github.com/lerna/lerna/tree/main/commands/exec#readme

Executes a shell command in each project's dir:
```shell
$ lerna exec 'rm -rf dist'
lerna notice cli v4.0.0
lerna info Executing command in 2 packages: "rm -rf dist"
lerna success exec Executed command in 2 packages: "rm -rf dist"
```
#### `lerna run`
See https://github.com/lerna/lerna/tree/main/commands/run#readme

Executes an npm script (`"scripts"` in each package's `package.json`).
`lerna run some-script` - executes the NPM SCRIPT command `some-command` in each package
```shell
$ lerna run build
lerna notice cli v4.0.0
lerna info Executing command in 2 packages: "yarn run build"
lerna info run Ran npm script 'build' in '@better-tmp/example-utils' in 1.9s:
yarn run v1.22.10
$ tsc
Done in 1.75s.
lerna info run Ran npm script 'build' in '@better-tmp/example-app' in 1.8s:
yarn run v1.22.10
$ tsc
Done in 1.69s.
lerna success run Ran npm script 'build' in 2 packages in 3.7s:
lerna success - @better-tmp/example-app
lerna success - @better-tmp/example-utils
```
---
# Publishing
See https://github.com/lerna/lerna/tree/main/commands/publish#readme

`lerna`'s big strength is publishing. It allows for 2 different versioning strategies:
* Fixed - All packages will be locked to the same version, specified in `lerna.json`
* Independent - Each package will have its own version as specified in `package.json`

"Fixed" mode is the default, so let's go ahead and do our first publish.

## Preconditions
#### Private repository
If using a private repository, make sure `lerna.json` has `command.publish.registry` set.

#### Sync with git
`lerna` attempts to ensure that your published packages and your git repository are in sync. 
##### If you have uncommitted changes, you'll see an error like:
```shell
$ lerna publish
lerna notice cli v4.0.0
lerna info current version 1.0.0
lerna info Assuming all packages changed
lerna ERR! EUNCOMMIT Working tree has uncommitted changes, please commit or remove the following changes before continuing:
lerna ERR! EUNCOMMIT M  package.json
lerna ERR! EUNCOMMIT UU packages/example-app/package.json
lerna ERR! EUNCOMMIT MM packages/example-app/src/index.ts
```
##### If you have commits that are not pushed, you'll see an error like:
```shell
$ lerna publish
lerna notice cli v4.0.0
lerna info current version 1.0.0
lerna ERR! EBEHIND Local branch 'master' is behind remote upstream origin/master
lerna ERR! EBEHIND Please merge remote changes into 'master' with 'git pull'
```