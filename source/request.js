import superagent from 'superagent';

/*
  TODO this should be moved to adapter.
*/
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
          /*
            TODO: handle servers that respond with a success status code when there is a validation error
          */
          reject(error);
        }
        // TODO: superagent parses JSON here, give user option to parse however they want? see http-client on npm
        resolve(response.body);
      });
  });
}
