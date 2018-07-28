export default {
    name_from_id(str) {
        let parts = str.split('@');
        let body = parts[1].split('/')[1];
        if (!body || body === '*') { body = '' } else { body = ' ' + body}
        return parts[0] + body;
    },

    station_name_from_id(str) {
        let parts = str.split('@');
        let station = parts[1].split('/')[1];
        return station + ' (' + parts[0] + ")";
    },

    distance: function (v1, v2) {
        let dx = v1[0] - v2[0];
        let dy = v1[1] - v2[1];
        let dz = v1[2] - v2[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },




}