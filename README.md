## My Web Application (Talkit)

* [General info](#general-info)
* [Technologies](#technologies)
* [Contents](#content)
* [Installation](#installation)
* [Features](#features)
* [References](#references)
* [Contact information](#contact-information)

## General Info
Our team, BBY01, is developing an online community for peer support to help people who are struggling with mental health and trauma by providing a safe space for them to discuss their issues and support each other.
	
## Technologies
Technologies used for this project:
* HTML, CSS
* JavaScript
* Express, JSDOM, Session, Multer
* socket.io
* mySQL, Cloudinary
* Heroku
	
## Content
Content of the project folder:

```
 Top level of project folder: 
├── .gitignore               # Git ignore file
├── login.html               # Landing HTML file, this is what users see when you come to url
├── signnup.html             # Sign Up page when users have not had accounts
├── main.html                # Home page, this is the first page users see after they log in
├── profile.html             # Profile page, this is the public user profile page
├── update-profile.html      # Update profile page, this is visible to regular users, users can update their profile information
├── share_story.html         # Share Story page, this is what users see if they select the plus icon (mobile) or Share Story tab (desktop)
├── story_comment.html       # Comment page, this is what users see when they select one story on the list on Home page
├── users.html               # Dashboard, this is only visible to admin users
└── README.md

It has the following subfolders and files:
├── .git                     # Folder for git repo
├── images                   # Folder for images
    /logo-01.png             # Branding image
    /logo-02.png             # Branding image
    /logo-03.png             # Branding image
    /logo-04.png             # Default profile image
├── scripts                  # Folder for scripts
    /easter-egg.js           # Hidden surprised, linked to login.html and main.html 
    /login.js                # Backend, linked to login.html
    /main.js                 # Backend, linked to main.html
    /messages.js             # Backend, linked to messages.html
    /profile.js              # Backend, linked to profile.html
    /share_story.js          # Backend, linked to share_story.html
    /signup.js               # Backend, linked to signup.html
    /story_comment.js        # Backend, linked to story_comment.html
    /update-profile.js       # Backend, linked to update-profile.js 
    /users.js                # Backend, linked to users.html
├── styles                   # Folder for styles
    /login.css               # Frontend, linked to login.html
    /main.css                # Frontend, linked to main.html
    /messages.css            # Frontend, linked to messages.html
    /profile.css             # Frontend, linked to profile.html
    /share_story.css         # Frontend, linked to share_story.html
    /signup.css              # Frontend, linked to signup.html
    /story_comment.css       # Frontend, linked to story_comment.html
    /update-profile.css      # Frontend, linked to update-profile.js 
    /users.css               # Frontend, linked to users.html

App Run File:
├── app.js                   # Run in port 8000


```

Tips for file naming files and folders:
* use lowercase with no spaces
* use dashes (not underscore) for word separation

## Installation


## Features
Core features:
* Share, edit or delete a post
* Read other posts
* Leave, edit or delete a comment on other posts
* Send and receive private messages to other users

Other features:
* Create/Sign up (new users)
* Log in
* Update profile picture, username, email, password, display name and bio

For Admin Users Only:
* Edit or delete any posts and comments
* Add, edit and delete any regular users' credentials

## References
Code from lines 1205 to 1235 in app.js was made by 
@author https://stackoverflow.com/users/395659/cloudymarble from the source 
@see https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection 
on stackoverflow.com

Code in messages.js was referred from the tutorial by
@author https://www.youtube.com/user/souravkumarpaul
@see https://www.youtube.com/watch?v=sSIXZk5uKi4 on youtube.com

Code from line 83 to 102 in messages.js was made by 
@author w3schools
@see https://www.w3schools.com/howto/howto_js_tabs.asp on w3schools.com

## Contact Information
Richard Ohata, richardohata@gmail.com
Chi Lan Huynh, chilanhuynh@hotmail.com
Jason Yoo, jyoo2649@gmail.com
Xinyang Li, xinyangli417@gmail.com
