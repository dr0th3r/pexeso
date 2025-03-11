# Quality Notice
This project was originally developed while I was still learning SvelteKit and building MVP for a competetion. At the time, 
the focus was on building out core features like the lobby, game, and results. Over time, as new features were added — 
such as leaderboards and card pack sections — the codebase evolved without undergoing proper refactoring to accommodate 
these additional functionalities. If I were to rebuild this project today, I would approach many things differently, particularly
by adopting a more scalable structure such as building it as MPA. This would allow for better separation of concerns, easier maintenance, 
and more efficient scaling of features. I would also put more emphasis on accessibility and caching.

# Aboout
This app was created for a competetion organized by **[Remante]("https://www.remante.com/")**. 
We would like to thank them for an opurtinity to participate as it greatly improved both our technical and soft skills.

# How to run
1. You'll need a [Firebase account]("https://firebase.google.com/")
2. You'll need to create a new project on Firebase
3. You'll need to setup authentication on Firebase and enable writing and reading in rules (in DB and in Storage)
4. You'll need to create an .env file in root directory of this clonned project and add enviroment variables 
which you can find in project settings in Firebase
```
VITE_APIKEY=
VITE_AUTHDOMAIN=
VITE_PROJECTID=
VITE_STORAGEBUCKET=
VITE_MESSAGINGSENDERID=
VITE_APPID=
VITE_MEASUREMENTID=
```
5. npm run dev -- --open
6. **Enjoy Playing!**
