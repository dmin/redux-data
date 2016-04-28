import request from './request';

export default function runAdapter(
  url,
  method,
  body,
  adapter
) {
  return request(
    url,
    method,
    body
  )
    .catch(error => {
      return adapter.handleError(error);
    });
}
