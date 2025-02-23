// NEED TO UPDATE WITH AWS API KEY AND PUT "apikey": "key" IN headers FOR ALL FETCH REQS (GET AND POST)
document.addEventListener('DOMContentLoaded', function () {
    const feedContainer = document.getElementById('feed');
    let offset = 0;
    const limit = 5;
    let loading = false;

    async function loadFeed() {
        if (loading) return;
        loading = true;

        try {
            const response = await fetch(`http://localhost:3000/feed?limit=${limit}&offset=${offset}`);
            const data = await response.json();

            if (data.feed.length === 0) {
                window.removeEventListener('scroll', handleScroll);
                return;
            }

            data.feed.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('post');

                postElement.innerHTML = `
                    <h3>${post.title}</h3>
                    <p>${post.description}</p>
                    ${post.video_url ? `<video data-src="${post.video_url}" class="lazy-video" muted playsinline></video>` : ''}
                `;

                feedContainer.appendChild(postElement);
            });

            offset += limit;
            lazyLoadVideos(); // Trigger lazy loading check
        } catch (error) {
            console.error('Error loading feed:', error);
        } finally {
            loading = false;
        }
    }

    function lazyLoadVideos() {
        const videos = document.querySelectorAll('.lazy-video');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    if (!video.src) {
                        video.src = video.getAttribute('data-src'); // Load video
                        video.removeAttribute('data-src');
                        video.load(); // Preload
                    }
                    observer.unobserve(video);
                }
            });
        }, { threshold: 0.5 });

        videos.forEach(video => observer.observe(video));
    }

    function autoPlayVideos() {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            const rect = video.getBoundingClientRect();
            const inViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;

            if (inViewport) {
                video.play();
            } else {
                video.pause();
            }
        });
    }

    function handleScroll() {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            loadFeed();
        }
        autoPlayVideos(); // Check and autoplay videos on scroll
    }

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.querySelectorAll('video').forEach(video => video.pause());
        } else {
            autoPlayVideos();
        }
    });

    loadFeed();
});