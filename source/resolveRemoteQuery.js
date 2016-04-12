import superagent from 'superagent';


export default function resolveRemoteQuery(
  url,
  http = superagent
) {
  const queryPromise = new Promise((resolve, reject) => {
    http.get(url).end((error, response) => {
      if (error) {
        reject(error.response.body);
      }
      resolve(response.body);
    });
  });

  return queryPromise;
}
