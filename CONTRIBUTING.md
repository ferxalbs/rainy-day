# Contributing to Rainy Day

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved. The community looks forward to your contributions.

> And if you like the project, but just don't have time to contribute, that's fine. There are other easy ways to support the project and show your appreciation, which we would also be very happy about:
>
> - Star the project
> - Tweet about it
> - Refer this project in your project's readme
> - Mention the project at local meetups and tell your friends/colleagues

## Table of Contents

- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Development API](#development-api)
- [Styleguides](#styleguides)
  - [Commit Messages](#commit-messages)

## I Have a Question

> If you want to ask a question, we assume that you have read the available [Documentation](./docs/).

Before you ask a question, it is best to search for existing [Issues](https://github.com/ferxalbs/rainy-day/issues) that might help you. In case you've found a suitable issue and still need clarification, you can write your question in this issue. It is also advisable to search the internet for answers first.

If you then still feel the need to ask a question and need clarification, we recommend the following:

- Open an [Issue](https://github.com/ferxalbs/rainy-day/issues/new).
- Provide as much context as you can about what you're running into.
- Provide project and platform versions (nodejs, npm, etc), depending on what seems relevant.

We will then take care of the issue as soon as possible.

## I Want To Contribute

### Reporting Bugs

#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report. Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you are using the latest version.
- Determine if your bug is really a bug and not an error on your side e.g. using incompatible environment components/versions.
- If you have forgotten how to use a feature, check the [Documentation](./docs/).
- Collect information about the bug:
  - Stack trace (Traceback)
  - OS, Platform and Version (Windows, Linux, macOS, x86, ARM)
  - Version of the interpreter, compiler, SDK, runtime environment, package manager, depending on what seems relevant.
  - Possibly your input and the output
  - Can you reliably reproduce the issue? And can you also reproduce it with older versions?

#### How to Submit a Good Bug Report

We use GitHub issues to track bugs and errors. If you run into an issue with the project:

- Open an [Issue](https://github.com/ferxalbs/rainy-day/issues/new). (Since we can't be sure whether it is a new bug or not, we ask you to strictly adhere to the template provided).
- Explain the behavior you would expect and the actual behavior.
- Please provide as much context as possible and describe the _reproduction steps_ that someone else can follow to recreate the issue on their own. This is usually defined by your code. For good bug reports you should isolate the problem and create a reduced test case.
- Provide the information you collected in the previous section.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Rainy Day, **including completely new features and minor improvements to existing functionality**. Following these guidelines will help maintainers and the community to understand your suggestion and find related suggestions.

- Open an [Issue](https://github.com/ferxalbs/rainy-day/issues/new).
- Describe the enhancement in detail and give an example of how the feature would be used.
- Explain why this enhancement would be useful to most Rainy Day users.

### Your First Code Contribution

#### Setup

1.  **Fork** the repository.
2.  **Clone** your fork.
3.  **Install dependencies**:
    ```bash
    pnpm install
    ```
4.  **Run development server**:
    ```bash
    pnpm tauri dev
    ```

#### Development API

Since the backend server is private/internal, we provide a **Development API** for contributors.

1.  Open an Issue requesting API Access (Label: `api-access`).
2.  Receive your `API_KEY` and configuration details.
3.  Add them to your `.env` file.

### Styleguides

#### Commit Messages

We generally follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

## Join The Project Team

If you are interested in becoming a core maintainer, please reach out to us via valid contact channels or active participation in PRs!
