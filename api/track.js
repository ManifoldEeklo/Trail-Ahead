// Tracks app opens (visits) and successful route generations. Uses Upstash
// Redis via the Vercel Marketplace integration — Redis.fromEnv() picks up
// UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN, which Vercel injects
// automatically once the integration is connected to this project. No
// secret ever needs to be typed into code.
var Redis = require('@upstash/redis').Redis;

module.exports = async function handler(req, res){
  if (req.method !== 'POST'){
    res.status(405).json({ error: 'Use POST' });
    return;
  }
  try{
    var redis = Redis.fromEnv();
    var body = req.body || {};
    var type = body.type;
    var deviceId = String(body.deviceId || '').slice(0, 100); // basic sanity cap, not an auth token

    if (!deviceId){
      res.status(400).json({ error: 'deviceId is required' });
      return;
    }

    if (type === 'visit'){
      await redis.incr('trailahead:visits:total');
      await redis.sadd('trailahead:visits:devices', deviceId);
    } else if (type === 'route'){
      await redis.incr('trailahead:routes:total');
    } else {
      res.status(400).json({ error: 'Unknown type — expected "visit" or "route"' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch(err){
    // Deliberately fails soft from the client's point of view (app.js only
    // fire-and-forgets this call and never blocks route generation on it) —
    // but still return a real error here for debugging.
    res.status(500).json({ error: err && err.message ? err.message : 'Tracking failed' });
  }
};
