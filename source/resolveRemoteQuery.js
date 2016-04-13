import superagent from 'superagent';


export default function resolveRemoteQuery(
  url,
  http = superagent
) {
  const queryPromise = new Promise((resolve, reject) => {
    http.get(url).end((error, response) => {
      if (error) {
        reject(error);
        // TODO reject(error.response.body)
        // need info from body if a validation error
      }
      resolve(response.body);
    });
  });

  return queryPromise;
}
