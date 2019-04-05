var $ = require('jquery');
var jsmediatags = require("jsmediatags");

function init() {
	var $players = $('[data-player]');
	if ($players.length) {
		$players.each(function () {
			var $this = $(this);
			var $playerElem = $this.find('audio')[0];
			var $playerBtnPlay = $this.find('[data-toggle]');
			var $playerCover = $this.find('[data-cover]');
			var $playerForward = $this.find('[data-forward]');
			var $playerBackward = $this.find('[data-backward]');
			var $playerArtist = $this.find('.player-artist');
			var $playerTitle = $this.find('.player-title');
			var $playerProgress = $this.find('.player-progress > i');

			/** Update Progress Bar **/
			setInterval(function () {
				var $width = ($playerElem.currentTime / $playerElem.duration) * 100;
				$playerProgress.css('width', $width + '%')
			}, 500);

			/** Play And Pause Function **/
			$playerBtnPlay.on('click', function () {
				$this.toggleClass('playing');
				if ($playerElem.paused) {
					$playerElem.play();
				} else {
					$playerElem.pause();
				}
			});

			/** Remove Class After End File **/
			$playerElem.onended = function() {
				$playerElem.currentTime = 0;
				$this.removeClass('playing');
				$playerProgress.css('width', '0%')
			};

			/** Forward 5s **/
			$playerForward.on('click', function () {
				$playerElem.currentTime = $playerElem.currentTime + 5;
			});

			/** Backward 5s **/
			$playerBackward.on('click', function () {
				if ($playerElem.currentTime > 5) {
					$playerElem.currentTime = $playerElem.currentTime - 5;
				}
			});

			/** Get MP3 Tag **/
			jsmediatags.read($playerElem.currentSrc, {
				onSuccess: function (item) {
					if( item.tags.picture !== undefined ) {
						var base64String = "";
						for (var i = 0; i < item.tags.picture.data.length; i++) {
							base64String += String.fromCharCode(item.tags.picture.data[i]);
						}
						var dataUrl = "data:" + item.tags.picture.format + ";base64," + window.btoa(base64String);
						$playerCover.css('background-image', 'url(' + dataUrl + ')');
					}
					$playerTitle.text(item.tags.title);
					$playerArtist.text(item.tags.artist);
					console.log(item);
				},
				onError: function (error) {
					console.log(error);
				}
			});
		});
	}
}

$(function () {
	init();
});
