import request from './request';

export default function runAdapter(
  url,
  method,
  body,
  adapter
) {
  console.log('in locus connect adapter');
  return request(
    url,
    method,
    body
  )
    .catch(error => {
      console.log(error.status);
      console.log('adapter ::', adapter);
      return adapter.handleError(error);
    });
}
