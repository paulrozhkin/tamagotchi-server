<a href="#">
    <img src="https://raw.githubusercontent.com/paulrozhkin/RestaurantClientApplication/master/app/src/main/res/drawable/logo.png" title="Tamagotchi" alt="Tamagotchi" width="200">
</a>

# Tamagotchi Server

![GitHub package.json version](https://img.shields.io/github/package-json/v/paulrozhkin/NodeJsTamagotchiServer)

This is the server application for the Tamagotchi restaurant chain.
The server provides an opportunity for customers to work with booking tables and ordering dishes in a restaurant.
It also provides an opportunity for the administration to manage the infrastructure of the restaurant.

---

## Linked Repositories
- [Web client](https://github.com/paulrozhkin/tamagotchi-web-client)
- [Android client application](https://github.com/paulrozhkin/tamagotch-android-client)
- [Android stuff application](https://github.com/ForsaiR/RestaurantEmployerApplication)
- [Tamagotchi Remote Library](https://github.com/paulrozhkin/tamagotchi-remote-library)

---

## Documentation
- [OpenApi 3 Specification](https://app.swaggerhub.com/apis/paul-rozhkin/itmo-tamagotchi/)
- [Project architecture](https://docs.google.com/document/d/1enQEfARTvvgzaP4rct-b3Cv25hwk_OPZI0ixIim86kI/edit?usp=sharing)

---

## Installation

### Clone
- Clone this repo to your local machine using `git clone https://github.com/paulrozhkin/NodeJsTamagotchiServer`

### Setup

- Install [PostgreSQL](https://www.postgresql.org/download/) on your machine

- Install npm packages in project directory

```shell
$ npm install
```

- Go to `config\config.json` and set up your environment

You can change the selected environment in `config\config_setup.js`

```$xslt
"development": {
    "config_id": "development",
    "app_name": "Restaurant application",
    "node_port": 3000,
    "database_name": "tamagotchi",
    "database_host": "localhost",
    "database_user": "postgres",
    "database_port": "5432",
    "database_password": "sql",
    "secretOrKeyJwt": "557C3FC82F68572774A392C865F8B3A32EA49B78B23D52628F46E3E87EC0F3F3",
    "files_path": "C:\\temp\\tamagotchi_server_files"
  }
```

---
## Using
### Tools:
- Database: PostgreSQL
    - Database adapter: [node-postgres](https://node-postgres.com/)
    - For migration uses: [node-pg-migrate](https://salsita.github.io/node-pg-migrate/#/)
---

## Contributing

> To get started...

### Step 1

- **Option 1**
    - 🍴 Fork this repo!

- **Option 2**
    - 👯 Clone this repo to your local machine using `https://github.com/paulrozhkin/NodeJsTamagotchiServer`

### Step 2

- **HACK AWAY!** 🔨🔨🔨

### Step 3

- 🔃 Create a new pull request using <a href="https://github.com/paulrozhkin/NodeJsTamagotchiServer/pulls" target="_blank">`https://github.com/paulrozhkin/NodeJsTamagotchiServer/pulls`.

---

## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
- Copyright 2020 © <a href="https://github.com/paulrozhkin" target="_blank">Paul Rozhkin</a>.

