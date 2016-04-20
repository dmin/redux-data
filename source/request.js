import superagent from 'superagent';


export default function request(
  url,
  method,
  body,
  http = superagent
) {
  // TODO implement without promise to avoid errors being swallowed?
  // TODO use standardized fetch API in place of this?
  return new Promise((resolve, reject) => {
    let httpRequest;

    if (/^GET$/i.test(method)) {
      httpRequest = http.get(url);
    }
    else if (/^(POST|PUT|PATCH|DELETE)$/i.test(method)) {
      httpRequest = (
        http
          .post(url)
          .set('X-Http-Method-Override', method) // TODO should we customize how the method overide is sent? ie with a different header, or a special field
          // TODO: when delete request is made I don't want to send anthing in the body
          .send(body) // TODO I believe superagent is setting content type to json here, should we offer customization?
      );
    }

    // TODO isolate CSRF protection - also isolate how to get token - this is probably rails specific
    let csrfToken = '';
    if (document.querySelector('meta[name="csrf-token"]')) {
      csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    }

    httpRequest
      // TODO figure out best way to handle CSRF token
      .set('X-CSRF-Token', csrfToken)
      .end((error, response) => {
        if (error) {
          // TODO: error.response.body.errors is a convention I use, can't depend on it
          // TODO: need to handle 404 not found errors

          // TODO: need to dispatch here,
          // how does redux form work?
          // might need to save data in the store abour errors?

          // Needs to be compatible with redux-form
          /*
            An error might happen here for a couple of reasons:
             - server gives a validation error (TODO:can we rely on http response codes to determine this? need config option)
             - http error - request fails for any number of reasons.

            Need to pass back errors here for either of the above circumstances
          */
          reject(error);
          // TODO reject(error.response.body)
          // need info from body if a validation error
        }
        // TODO: superagent parses JSON here, give user option to parse however they want? see http-client on npm
        resolve(response.body);
      });
  });
}
