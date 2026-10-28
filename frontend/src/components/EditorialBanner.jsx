const EditorialBanner = () => {
    return (
        <section className="editorial" aria-label="Collection du moment">
            <div className="editorial__inner">
                <img
                    src="/images/women3.jpeg"
                    alt="Mannequin portant une pièce de la collection d'automne"
                    className="editorial__image"
                />

                <div className="editorial__content">
                    <p className="editorial__overline">Collection d'automne</p>
                    <h2 className="editorial__title">Les matières qui réchauffent</h2>
                    <p className="editorial__text">
                        Laine mérinos, maille côtelée et coton épais : une sélection pensée
                        pour les premiers jours frais.
                    </p>
                    <a href="#produits" className="editorial__button">Découvrir la collection</a>
                </div>
            </div>
        </section>
    );
};

export default EditorialBanner;