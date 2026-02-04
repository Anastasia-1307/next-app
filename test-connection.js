fetch('http://localhost:4000/me')
  .then(res => res.json())
  .then(data => console.log('SUCCESS:', data))
  .catch(err => console.error('ERROR:', err));
