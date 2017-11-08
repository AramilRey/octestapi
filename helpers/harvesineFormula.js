const deg2rad = deg => deg * (Math.PI / 180);
const earthRadius = 6371;

module.exports = (lat1, lon1, lat2, lon2) => {
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  let d = Math.sin(dLat / 2) * Math.sin(dLat / 2);
  d += Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return earthRadius * 2 * Math.atan2(Math.sqrt(d), Math.sqrt(1 - d));
};

