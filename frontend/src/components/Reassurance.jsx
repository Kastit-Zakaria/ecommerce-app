const Reassurance = () => {
    return (
        <section className="reassurance" aria-label="Nos engagements">
            <div className="reassurance__inner">

                <div className="reassurance__item">
                    <svg className="reassurance__icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                        <path d="M3 7h11v9H3z"></path>
                        <path d="M14 10h4l3 3v3h-7z"></path>
                        <circle cx="7" cy="17.5" r="1.6"></circle>
                        <circle cx="17" cy="17.5" r="1.6"></circle>
                    </svg>
                    <div>
                        <p className="reassurance__title">Livraison offerte</p>
                        <p className="reassurance__text">Dès 50 € d'achat</p>
                    </div>
                </div>

                <div className="reassurance__item">
                    <svg className="reassurance__icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                        <path d="M4 12a8 8 0 1 0 2.3-5.6"></path>
                        <path d="M4 4v4h4"></path>
                    </svg>
                    <div>
                        <p className="reassurance__title">Retours gratuits</p>
                        <p className="reassurance__text">Sous 30 jours</p>
                    </div>
                </div>

                <div className="reassurance__item">
                    <svg className="reassurance__icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                        <rect x="5" y="10" width="14" height="10" rx="1"></rect>
                        <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
                    </svg>
                    <div>
                        <p className="reassurance__title">Paiement sécurisé</p>
                        <p className="reassurance__text">Bancontact, Visa, Mastercard</p>
                    </div>
                </div>

                <div className="reassurance__item">
                    <svg className="reassurance__icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                        <path d="M5 13v-1a7 7 0 0 1 14 0v1"></path>
                        <rect x="3" y="13" width="4" height="6" rx="1"></rect>
                        <rect x="17" y="13" width="4" height="6" rx="1"></rect>
                    </svg>
                    <div>
                        <p className="reassurance__title">Service client</p>
                        <p className="reassurance__text">7 jours sur 7</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Reassurance;