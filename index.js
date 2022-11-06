/**
 * This example is using the Authorization Code flow.
 *
 * In root directory run
 *
 *     npm install express
 *
 * then run with the followinng command. If you don't have a client_id and client_secret yet,
 * create an application on Create an application here: https://developer.spotify.com/my-applications to get them.
 * Make sure you whitelist the correct redirectUri in line 26.
 *
 *     node access-token-server.js "<Client ID>" "<Client Secret>"
 *
 *  and visit <http://localhost:8888/login> in your Browser.
 */
 const SpotifyWebApi = require('spotify-web-api-node');
 const express = require('express');
 
 const scopes = [
   'ugc-image-upload',
   'user-read-playback-state',
   'user-modify-playback-state',
   'user-read-currently-playing',
   'streaming',
   'app-remote-control',
   'user-read-email',
   'user-read-private',
   'playlist-read-collaborative',
   'playlist-modify-public',
   'playlist-read-private',
   'playlist-modify-private',
   'user-library-modify',
   'user-library-read',
   'user-top-read',
   'user-read-playback-position',
   'user-read-recently-played',
   'user-follow-read',
   'user-follow-modify'
 ];
 
 const spotifyApi = new SpotifyWebApi({
   redirectUri: 'http://localhost:8888/callback',
   clientId: '6105f2b1daed4c57abe3d461437ca7f8',
   clientSecret: '5db52804c34f4407ba7815ea0fd62b6e'
 });
 
 const app = express();

 app.set("view engine", "ejs");
 app.use(express.static(__dirname + '/public'));
 

 app.get('/', (req, res) => {
  res.render('home');

});



 app.get('/login', (req, res) => {
   res.redirect(spotifyApi.createAuthorizeURL(scopes));
 });
 
 app.get('/callback', (req, res) => {
   const error = req.query.error;
   const code = req.query.code;
   const state = req.query.state;
 
   if (error) {
     console.error('Callback Error:', error);
     res.send(`Callback Error: ${error}`);
     return;
   }
 
   spotifyApi
     .authorizationCodeGrant(code)
     .then(async(data) => {
       const access_token = data.body['access_token'];
       const refresh_token = data.body['refresh_token'];
       const expires_in = data.body['expires_in'];
 
       spotifyApi.setAccessToken(access_token);
       spotifyApi.setRefreshToken(refresh_token);
 
       console.log('access_token:', access_token);
       console.log('refresh_token:', refresh_token);

        
        /* Get a User’s Top Artists*/
        data = await spotifyApi.getMyTopArtists()
        let topArtists = data.body.items;
        const artistsList=[];
        const artistsPopularityList = []
        const artistsIdList = []
        for(i = 0; i < 10; i++)
        {
            artistsList.push(topArtists[i]["name"]);
            artistsPopularityList.push(topArtists[i]["popularity"]);
        }
        for(i=0; i < 5; i++)
        {
            artistsIdList.push(topArtists[i]["id"]);
        }
        for(i = 0; i < 10; i++)
        {
            console.log(artistsList[i]);
        }
        for(i = 0; i < 10; i++)
        {
            console.log(artistsPopularityList[i]);
        }
        for(i = 0; i < 5; i++)
        {
            console.log(artistsIdList[i]);
        }


        /* Get a User’s Top Tracks*/
        data = await spotifyApi.getMyTopTracks()
        let topTracks = data.body.items;
        const tracksList=[];
        const tracksPopularityList=[];
        for(i = 0; i < 10; i++)
        {
            tracksList.push(topTracks[i]["name"]);
            tracksPopularityList.push(topTracks[i]["popularity"])
        }
        for(i = 0; i < 10; i++)
        {
            console.log(tracksList[i]);
        }
        for(i = 0; i < 10; i++)
        {
            console.log(tracksPopularityList[i]);
        }

       console.log(
         `Sucessfully retreived access token. Expires in ${expires_in} s.`
       );
       //res.send('Success! You can now close the window.');
       res.render('results', {artistsList, artistsPopularityList, tracksList, tracksPopularityList});
 
       setInterval(async () => {
         const data = await spotifyApi.refreshAccessToken();
         const access_token = data.body['access_token'];
 
         console.log('The access token has been refreshed!');
         console.log('access_token:', access_token);
         spotifyApi.setAccessToken(access_token);
       }, expires_in / 2 * 1000);
     })
     .catch(error => {
       console.error('Error getting Tokens:', );
       res.send(`Error getting Tokens: ${error}`);
     });
 });
 
 app.listen(8888, () =>
   console.log(
     'HTTP Server up. Now go to http://localhost:8888/login in your browser.'
   )
 );