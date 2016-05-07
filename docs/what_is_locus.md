# WHAT IS REDUX-DATA? WHAT DOES IT DO?

At a high level, Redux-Data is responsible for keeping the state of your client-side application and your server/database in sync.

The client side app does not (cannot) contain the entire state of the server, so Redux-Data is responsible for loading additional sections of the server state on to the client as needed. (how does 'real time push data work'?)

Changes to application state made by the client are sent to the server
