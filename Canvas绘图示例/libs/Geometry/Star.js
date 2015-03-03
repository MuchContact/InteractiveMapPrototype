//CLASS:几何图形五角星
function Star(center, r) {
    //中心点
    this.center = center;
    //五角星的长半径
    this.r = r;
    var points = this.getPoints(center, r);
    LinerRing.call(this, points);
}

Star.prototype = new LinerRing();

Star.prototype.getPoints = function(center, r) {
    var point, points = [];
    var angle = 0;
    var degree = Math.PI / 180;
    for(var i = 0; i < 10; i++) {
        var radius = (i % 2 == 0)? r : r/2;
        point = new Point(center.x + Math.sin(angle * degree) * radius, center.y + Math.cos(angle * degree) * radius);    
        points.push(point);
        angle+=36;
    }
    return points;
}

Star.prototype.geoType = "LinerRing";