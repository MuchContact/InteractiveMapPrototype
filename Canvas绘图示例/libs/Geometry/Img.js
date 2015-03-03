//CLASS: œ‘ æÕºœÒ¿‡°£
function Img(point, image) {
	Geometry.apply(this, arguments);
	this.point = point;
	if(typeof image == Image) {
		this.useUrl = false;
		this.image = image;
	}else {
		this.useUrl = true;
		this.image = image;
	}
}

Img.prototype = new Geometry();

Img.prototype.geoType = "Img";

Img.prototype.getBounds = function () {
	return new CanvasSketch.Bounds(this.point.x, this.point.y, this.point.x, this.point.y);
}