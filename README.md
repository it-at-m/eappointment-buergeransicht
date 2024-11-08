<div id="top"></div>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/it-at-m/eappointment-buergeransicht">
    <img src="https://assets.muenchen.de/logos/itm/itM_Basislogo_gelb_schwarz-128.png" alt="Logo">
  </a>

<h3 align="center">E-appointment Frontend</h3>
</div>


<!-- ABOUT THE PROJECT -->
## About The Project

This project is frontend client for Appointment system (Zeit Managemenet System - ZMS). It provides various functionalities that would otherwise have to be created by the user:

- Detailed configuration of the rollup-config
- Preconfigured build and release pipeline
- Dev server for local development
- Instructions to use the package locally with `npm pack`
- Integrated API Gateway

<p align="right">(<a href="#top">back to top</a>)</p>

### Built With

This project is built with:

* [Vue.js](https://vuejs.org)
* [Vuetify](https://vuetifyjs.com/en/)
* [Rollup](https://github.com/rollup/rollup)
* [vue-sfc-rollup](https://github.com/team-innovation/vue-sfc-rollup)
* [Sping API-Gateway](https://spring.io/guides/gs/gateway/)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

_Below is an example of how you can installing and setup up your service_

1. `git clone `
2. `mvn install`
3. `npm run build`

### Developing the library locally

1. Start the dev server with `npm run serve`
2. Start the Spring API-Gateway

### Use your library in another project locally

Run the following commands in your library:

1. `npm run build`
2. `npm run pack`

Make sure you have provided all the necessary dependencies in your vuetify project and add the library vai `file path`:

```
"eappointment-buergeransicht": "file:../eappointment-buergeransicht-1.0.1.tgz"
```

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Branch Naming Convention
To keep our branch names organized and easily understandable, we follow a specific naming convention for all branches created in this repository. Please adhere to this convention when creating new branches:

1. **type**: The type of work the branch represents. This should be one of the following:
   - `feature`: For new features or enhancements.
   - `bugfix`: For bug fixes.
   - `hotfix`: For urgent fixes that need to be applied quickly.
   - `cleanup`: For code refactoring, or documentation updates.
   - `docs`: For updating documentation such as the README.md CODE_OF_CONDUCT.md LICENSE.md CHANGELOG.md CONTRIBUTING.md. Providing a ticket number or project for docs is optional.
   - `chore`: For maintaining and updating dependencies, libraries, PHP/Node/Twig Versions, or other maintenance work.

2. **project**: The project identifier. This should be:
   - `zms` for the ZMS project.
   - `mpdzbs` for the MPDZBS project.

3. **issue number**: The ticket or issue number related to this branch (use digits only). This helps track the branch to a specific issue in the project management system.

4. **description**: A brief, lowercase description of the branch's purpose, using only lowercase letters, numbers, and hyphens (`-`).

- Always use lowercase letters and hyphens for the description.
- The issue number should be a numeric ID corresponding to the relevant ticket or task.
- Descriptions should be concise and informative, summarizing the branch's purpose.

#### Examples

- **Feature Branch**: `feature-zms-12345-this-is-a-feature-in-the-zms-project`
- **Bugfix Branch**: `bugfix-mpdzbs-67890-fix-crash-on-startup`
- **Hotfix Branch**: `hotfix-zms-98765-critical-fix-for-login`
- **Cleanup Branch**: `cleanup-mpdzbs-11111-remove-unused-code`
- **Chore Branch**: `chore-zms-2964-composer-update`
- **Docs Branch**: `docs-zms-0000-update-readme` `docs-zms-release-40-update-changelog`

#### Regular Expression

The branch name must match the following regular expression:
`^(feature|hotfix|bugfix|cleanup|maintenance|docs)-(zms|mpdzbs)-[0-9]+-[a-z0-9-]+$`

**For further commit rules please refer to https://www.conventionalcommits.org/en/v1.0.0-beta.4/**

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

it@m - opensource@muenchen.de

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/it-at-m/eappointment-buergeransicht.svg?style=for-the-badge
[contributors-url]: https://github.com/it-at-m/eappointment-buergeransicht/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/it-at-m/eappointment-buergeransicht.svg?style=for-the-badge
[forks-url]: https://github.com/it-at-m/eappointment-buergeransicht/network/members
[stars-shield]: https://img.shields.io/github/stars/it-at-m/eappointment-buergeransicht.svg?style=for-the-badge
[stars-url]: https://github.com/it-at-m/eappointment-buergeransicht/stargazers
[issues-shield]: https://img.shields.io/github/issues/it-at-m/eappointment-buergeransicht.svg?style=for-the-badge
[issues-url]: https://github.com/it-at-m/eappointment-buergeransicht/issues
[license-shield]: https://img.shields.io/github/license/it-at-m/eappointment-buergeransicht.svg?style=for-the-badge
[license-url]: https://github.com/it-at-m/eappointment-buergeransicht/blob/master/LICENSE
[product-screenshot]: images/screenshot.png
