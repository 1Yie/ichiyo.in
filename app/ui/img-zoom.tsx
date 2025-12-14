'use client';

import { useEffect } from 'react';
import mediumZoom, { Zoom } from 'medium-zoom';

export default function ImageZoom() {
	useEffect(() => {
		const zoom = mediumZoom({ margin: 32 }) as Zoom;

		const attachZoomToImages = () => {
			const imgs = Array.from(
				document.querySelectorAll('img[data-zoom="true"]')
			) as HTMLImageElement[];

			imgs.forEach((img) => {
				if (zoom.getImages().includes(img)) return;

				img.setAttribute('fetchpriority', 'low');
				img.setAttribute('loading', 'lazy');
				img.setAttribute('decoding', 'async');

				if (img.complete && img.naturalWidth !== 0) {
					zoom.attach(img);
				} else {
					const onLoad = () => {
						zoom.attach(img);
						img.removeEventListener('load', onLoad);
					};
					img.addEventListener('load', onLoad);
				}
			});
		};

		attachZoomToImages();

		const observer = new MutationObserver(() => {
			attachZoomToImages();
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});

		return () => {
			zoom.detach();
			observer.disconnect();
		};
	}, []);

	return null;
}
