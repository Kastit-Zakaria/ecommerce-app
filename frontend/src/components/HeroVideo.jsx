const HeroVideo = () => {
    return (
        <section className="hero-video" aria-label="Bannière d'accueil">
            <video
                className="hero-video__media"
                src="/videos/hero.webm"
                autoPlay
                muted
                loop
                playsInline
            ></video>

            <div className="hero-video__overlay"></div>

            <div className="hero-video__content">
                <p className="hero-video__subtitle">Nouvelle saison</p>
                <h1 className="hero-video__title">La collection est arrivée</h1>
                <a href="#produits" className="hero-video__button">Découvrir</a>
            </div>
        </section>
    );
};

export default HeroVideo;