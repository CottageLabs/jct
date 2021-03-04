# Building the JCT website

## Running the site in development

The JCT is built using [Hugo](https://gohugo.io/). In order to update changes or create new pages, you need Hugo installed. 

See the Hugo website for [installation instructions](https://gohugo.io/getting-started/installing/)

Once you have Hugo installed, clone the code from github and cd to the jct directory.

To run the server in developmemt mode (any changes to files are picked up automatically).
```
hugo server -D
```

To list all of the static pages and their url
```
hugo list all
```

## Publishing the hugo site

See notes above on installing Hugo and cloning the code. To publish the static site in the production environment, run the command
```
hugo
```
This will create a directory called `public` which will contain all of the html pages and the associated assets. For deployment, this directory needs to be served.

To publish the static site for the staging environment, run the command
```
hugo --environment staging
```
This will similarly create a directory called `public` which will contain all of the html pages and the associated assets. For deployment, this directory needs to be served. I have configured the staging environemnt to be `jct.cottagelabs.com`.

## Hugo development notes

### Theme

I have created a theme called [mainTheme](themes/mainTheme) which is a minimalist theme. 

All of the design for the website is located in [layouts](./layouts)


### Layouts

There are 4 base page layouts
1. [Index.html](layouts/index.html)
 - This is used by the homepage
 - We need a content file called [\_index.md](content/_index.md), in order to serve the home page. 
     - The file should contain essential page metadata like title and description, which is used in the layout.
     - The layout is self contained, and doesn't need any content in the content file (as all of the text comes from the js). 

2. [default](layouts/_default/single.html)
 - This is the default layout for all of the static pages and incorporates the design of the static pages.
 - In order to create a page using this layout:
     - Create a file in the content directory. This is the default layout that will be used by the file.
     - The file should contain essential page metadata like title and description, which is used in the layout.
     - The main body of text for the page is served by the markdown content provided in the file.
   - Hugo will build and serve a static page with the filename in the url (eg: /apidocs or /faq or /how-it-works)

3. [minimal](layouts/minimal/single.html)
 - This a layout of _type_ [minimal](layouts/minimal/single.html)
 - It looks similar to the home page, with a different title and a footer without the navigation links
 - In order to create a page using this layout:
     - Create a file in the content directory 
     - The file should contain essential page metadata like title and description, which is used in the layout.
     - The layout is self contained, and doesn't need any content in the content file.
     - Hugo will build and serve a static page with the filename in the url (eg: /coming-soon)
     - *Note:* add 'type=minimal' in the metadata of the file, to instruct hugo to use this layout for the page. For example,
```
    ---
    title: "Coming Soon"
    date: 2021-02-14T04:44:50Z
    description: "Journal Checker Tool: Plan S Compliance Validator is coming soon."
    type: "minimal"
    ---
```


4. [blank](layouts/blank/single.html)
 - This a layout of _type_ [blank](layouts/blank/single.html)
 - This has the design of the static pages with no site js, and instead has the plugin js
 - In order to create a page using this layout:
     - Create a file in the content directory 
     - The file should contain essential page metadata like title and description, which is used in the layout.
     - Hugo will build and serve a static page with the filename in the url (eg: /widget-example)
     - *Note:* add 'type=blank' in the metadata of the file, to instruct hugo to use this layout for the page. For example,
```
    ---
    title: "Widget example"
    date: 2021-02-14T04:44:50Z
    description: "Page demonstrating how to embed the Journal Checker Tool."
    type: "blank"
    ---
```

### Config files
The config files used by Hugo are located in the config directory. See [configuration/](https://gohugo.io/getting-started/configuration/) in the Hugo docs for details. The essentials are
 - [config/\_default](default) provides the default settings.
 - [config/production](production) provides settings for the production environment.
 - [config/staging](staging) provides settings for the staging environment.
 - When running `hugo --environment staging` or `hugo --environment production`, Hugo will use every settings from [config/\_default](default) and merge the chosen environment on top of those.

 The different config files in [config/\_default](default) are:
 - [config/\_default/config.toml](config/\_default/config.toml): override the config options for the Hugo defined variables. The complete list of options is available [here](https://gohugo.io/getting-started/configuration/#all-configuration-settings).
 - [config/\_default/markup.toml](config/\_default/markup.toml): The variables mentioned here override the default values for the Hugo defined markup variables. The complete list of options is available [here](https://gohugo.io/getting-started/configuration-markup).
 - [config/\_default/menu.toml](config/\_default/markup.toml): The configuration options in this file define the different menu options displayed in the footer. The complete list of options is available [here](https://gohugo.io/content-management/menus/#add-non-content-entries-to-a-menu).
 - [config/\_default/params.toml](config/\_default/params.toml): The user defined configuration options need to be added to this file. It can contain any key-value pair and can be nested. 

**Note: Default environments are development with `hugo server` and production with `hugo`.**


### Useful commands

To create a new static site

```
hugo new site jct
```

To create a new theme 
```
hugo new theme mainTheme
```

To create a new static page
```
hugo new apidocs.md
hugo new coming-soon.md
```

To run the server in developmemt mode (any changes to files are picked up automatically).
```
hugo server -D
```

Hugo list all of the static pages and their url
```
hugo list all
```

To publish the static site in the production environment
```
hugo
```

To publish the static site in the staging environment
```
hugo --environment staging
```
