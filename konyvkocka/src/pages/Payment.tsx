import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type PlanId = 'monthly' | 'quarterly' | 'yearly'

type Plan = {
    id: PlanId
    label: string
    price: number
    discount: number
    note: string
}

type CountryGroup = {
    label: string
    items: { code: string; name: string }[]
}

const PLANS: Record<PlanId, Plan> = {
    monthly: { id: 'monthly', label: '1 hónap', price: 2990, discount: 0, note: 'Rugalmas előfizetés' },
    quarterly: { id: 'quarterly', label: '3 hónap', price: 7490, discount: 0.16, note: 'Kedvezőbb havidíj' },
    yearly: { id: 'yearly', label: '12 hónap', price: 24990, discount: 0.30, note: 'Legjobb ár hosszú távra' },
}

const COUNTRY_GROUPS: CountryGroup[] = [
    { label: 'Európa', items: [
        { code: 'HU', name: 'Magyarország' }, { code: 'AT', name: 'Ausztria' }, { code: 'RO', name: 'Románia' }, { code: 'SK', name: 'Szlovákia' },
        { code: 'DE', name: 'Németország' }, { code: 'CZ', name: 'Csehország' }, { code: 'PL', name: 'Lengyelország' }, { code: 'SI', name: 'Szlovénia' },
        { code: 'HR', name: 'Horvátország' }, { code: 'IT', name: 'Olaszország' }, { code: 'FR', name: 'Franciaország' }, { code: 'ES', name: 'Spanyolország' },
        { code: 'PT', name: 'Portugália' }, { code: 'GR', name: 'Görögország' }, { code: 'BG', name: 'Bulgária' }, { code: 'CY', name: 'Ciprus' },
        { code: 'BE', name: 'Belgium' }, { code: 'NL', name: 'Hollandia' }, { code: 'LU', name: 'Luxemburg' }, { code: 'IE', name: 'Írország' },
        { code: 'DK', name: 'Dánia' }, { code: 'SE', name: 'Svédország' }, { code: 'FI', name: 'Finnország' }, { code: 'EE', name: 'Észtország' },
        { code: 'LV', name: 'Lettország' }, { code: 'LT', name: 'Litvánia' }, { code: 'MT', name: 'Málta' },
        { code: 'NO', name: 'Norvégia' }, { code: 'IS', name: 'Izland' }, { code: 'LI', name: 'Liechtenstein' }, { code: 'CH', name: 'Svájc' },
        { code: 'GB', name: 'Egyesült Királyság' }, { code: 'TR', name: 'Törökország' },
    ]},
    { label: 'Amerika', items: [
        { code: 'US', name: 'Egyesült Államok' }, { code: 'CA', name: 'Kanada' },
    ]},
    { label: 'Ázsia', items: [
        { code: 'JP', name: 'Japán' }, { code: 'KR', name: 'Dél-Korea' }, { code: 'SG', name: 'Szingapúr' }, { code: 'HK', name: 'Hongkong' },
        { code: 'TW', name: 'Tajvan' }, { code: 'IL', name: 'Izrael' }, { code: 'AE', name: 'Egyesült Arab Emírségek' }, { code: 'SA', name: 'Szaúd-Arábia' },
        { code: 'QA', name: 'Katar' }, { code: 'KW', name: 'Kuvait' }, { code: 'BH', name: 'Bahrein' }, { code: 'OM', name: 'Omán' }, { code: 'MY', name: 'Malajzia' },
    ]},
    { label: 'Óceánia', items: [
        { code: 'AU', name: 'Ausztrália' }, { code: 'NZ', name: 'Új-Zéland' },
    ]},
]

const formatHuf = (value: number) => `${value.toLocaleString('hu-HU')} Ft`
const generateTxId = () => `TX-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

function Payment(): React.JSX.Element {
    const navigate = useNavigate()
    const [step, setStep] = useState<number>(1)
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(() => {
        try {
            const saved = localStorage.getItem('kk_pay_selected')
            if (!saved) return null
            const parsed = JSON.parse(saved) as Plan
            return parsed?.id ? parsed : null
        } catch (error) {
            console.error('Nem sikerült visszatölteni a csomagot', error)
            return null
        }
    })

    const [billing, setBilling] = useState({
        lastName: '',
        firstName: '',
        email: '',
        phone: '',
        country: '',
        zip: '',
        city: '',
        address: '',
    })

    const [card, setCard] = useState({ number: '', exp: '', cvc: '' })
    const [showValidation, setShowValidation] = useState(false)
    const [countryOpen, setCountryOpen] = useState(false)
    const [modalState, setModalState] = useState({ open: false, success: true, method: '', txId: '' })

    const formRef = useRef<HTMLFormElement>(null)
    const countryRef = useRef<HTMLDivElement>(null)

    const countryNameMap = useMemo(() => {
        const map: Record<string, string> = {}
        COUNTRY_GROUPS.forEach(group => {
            group.items.forEach(country => {
                map[country.code] = country.name
            })
        })
        return map
    }, [])

    useEffect(() => {
        if (selectedPlan) {
            localStorage.setItem('kk_pay_selected', JSON.stringify(selectedPlan))
        }
    }, [selectedPlan])

    useEffect(() => {
        const clickAway = (event: MouseEvent) => {
            if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
                setCountryOpen(false)
            }
        }

        document.addEventListener('click', clickAway)
        return () => document.removeEventListener('click', clickAway)
    }, [])

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [step])

    const fieldClass = (value: string, required = true, extraCheck = true) => {
        if (!showValidation) return 'form-control'
        if (required && (!value.trim() || !extraCheck)) return 'form-control is-invalid'
        return 'form-control is-valid'
    }

    const selectPlan = (id: PlanId) => {
        setSelectedPlan(PLANS[id])
    }

    const handleBillingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setBilling(prev => ({ ...prev, [name]: value }))
    }

    const handleCardChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setCard(prev => ({ ...prev, [name]: value }))
    }

    const goToStep = (target: number) => setStep(target)

    const handleBillingSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        setShowValidation(true)
        const formIsValid = formRef.current?.reportValidity()
        if (!formIsValid || !billing.country) {
            return
        }
        goToStep(3)
    }

    const showPaymentModal = (success: boolean, method: string) => {
        setModalState({ open: true, success, method, txId: generateTxId() })
    }

    const handleModalButton = () => {
        if (modalState.success) {
            localStorage.setItem('kk_session', 'demo')
            navigate('/user')
        } else {
            setModalState(prev => ({ ...prev, open: false }))
        }
    }

    const payWithCard = () => {
        const plainNumber = card.number.replace(/\s+/g, '')

        if (!plainNumber || plainNumber.length < 13) {
            alert('Érvénytelen kártyaszám!')
            return
        }

        if (!/^\d{2}\/\d{2}$/.test(card.exp)) {
            alert('Érvénytelen lejárati dátum! Formátum: MM/YY')
            return
        }

        if (card.cvc.trim().length < 3) {
            alert('Érvénytelen CVC kód!')
            return
        }

        showPaymentModal(true, 'kártya')
    }

    const success = (method: string) => showPaymentModal(true, method)

    const emailValid = billing.email ? /^\S+@\S+\.\S+$/.test(billing.email) : false

    const summaryPlanLabel = selectedPlan?.label ?? '—'
    const summaryPlanPrice = selectedPlan ? formatHuf(selectedPlan.price) : '—'
    const countryLabel = billing.country ? countryNameMap[billing.country] ?? billing.country : 'Válassz…'

    return (
        <>
            {/* Stepper */}
            <div className="stepper container">
                {[1, 2, 3].map(idx => (
                    <Fragment key={`step-${idx}`}>
                        <div className={`step ${step === idx ? 'active' : ''} ${step > idx ? 'done' : ''}`} data-step={idx}>
                            <span className="bubble">{idx}</span>
                            <span className="label">{idx === 1 ? 'Csomag kiválasztása' : idx === 2 ? 'Számlázási adatok' : 'Fizetés'}</span>
                        </div>
                        {idx < 3 && <div className="divider" />}
                    </Fragment>
                ))}
            </div>

            <main className="container-fluid px-4 py-4">
                {/* STEP 1 */}
                <section id="step-1" className={`about-panel p-3 mt-2 ${step !== 1 ? 'd-none' : ''}`}>
                    <div className="d-flex justify-content-between align-items-center mb-2 step1-header">
                        <h2 className="about-title m-0">Válaszd ki az előfizetésed</h2>
                        <div className="note-banner"><i className="bi bi-shield-check" /> Minden csomag bármikor lemondható</div>
                    </div>

                    <div className="pricing-row plans-grid">
                        {Object.values(PLANS).map(plan => (
                            <div
                                key={plan.id}
                                className={`pricing-card plan-card ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                                data-plan={plan.id}
                                onClick={() => selectPlan(plan.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault()
                                        selectPlan(plan.id)
                                    }
                                }}
                            >
                                <div>
                                    <h4>{plan.label}</h4>
                                    <div className="plan-meta">{plan.note}</div>
                                </div>
                                <div className="pricing-cta text-center">
                                    <div className="price">{formatHuf(plan.price)}</div>
                                    <div>
                                        <small className={plan.discount ? 'discount' : 'text-muted'}>
                                            {plan.discount ? `~${Math.round(plan.discount * 100)}% megtakarítás` : 'Kedvezmény: —'}
                                        </small>
                                    </div>
                                    <button type="button" className="btn btn-kk fw-bold mt-2 select-plan" onClick={(e) => { e.stopPropagation(); selectPlan(plan.id) }}>
                                        Kiválasztom
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="about-panel p-3 mt-2">
                        <h5 className="mb-2" style={{ color: 'var(--secondary)' }}>Mit old fel az előfizetés?</h5>
                        <ul className="mb-0">
                            <li>Reklámmentes élmény</li>
                            <li>Korlátlan film- és könyv hozzáférés</li>
                            <li>Offline letöltés</li>
                            <li>Exkluzív tartalmak és integrációk</li>
                        </ul>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-3 step1-footer">
                        <div className="selection-banner">
                            Kiválasztott csomag: <strong>{summaryPlanLabel}</strong> • Várható összeg: <strong>{summaryPlanPrice}</strong>
                        </div>
                        <div className="pay-actions">
                            <Link to="/about" className="btn btn-outline-light"><i className="bi bi-arrow-left" /> Vissza</Link>
                            <button id="to-step-2" className="btn btn-kk" onClick={() => goToStep(2)} disabled={!selectedPlan}>
                                Tovább <i className="bi bi-arrow-right" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* STEP 2 */}
                <section id="step-2" className={`about-panel p-3 mt-3 ${step !== 2 ? 'd-none' : ''}`}>
                    <h2 className="about-title">Számlázási és kapcsolati adatok</h2>
                    <form id="billing-form" ref={formRef} onSubmit={handleBillingSubmit} noValidate>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Vezetéknév</label>
                                <input className={fieldClass(billing.lastName)} name="lastName" value={billing.lastName} onChange={handleBillingChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Keresztnév</label>
                                <input className={fieldClass(billing.firstName)} name="firstName" value={billing.firstName} onChange={handleBillingChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">E-mail</label>
                                <input type="email" className={fieldClass(billing.email, true, emailValid)} name="email" value={billing.email} onChange={handleBillingChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Telefon (opcionális)</label>
                                <input className="form-control" name="phone" value={billing.phone} onChange={handleBillingChange} type="tel" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Ország</label>
                                <div className="custom-select-wrapper position-relative" ref={countryRef}>
                                    <button
                                        className={`form-select text-start ${showValidation && !billing.country ? 'is-invalid' : billing.country ? 'is-valid' : ''}`}
                                        type="button"
                                        id="countryDropdown"
                                        aria-expanded={countryOpen}
                                        onClick={(e) => { e.stopPropagation(); setCountryOpen(prev => !prev) }}
                                    >
                                        <span id="countryLabel">{countryLabel}</span>
                                    </button>
                                    <div className={`custom-select-menu ${countryOpen ? 'show' : ''}`} id="countryMenu">
                                        {COUNTRY_GROUPS.map(group => (
                                            <div key={group.label}>
                                                <div className="country-header">{group.label}</div>
                                                {group.items.map(country => (
                                                    <div
                                                        key={country.code}
                                                        className="country-item"
                                                        data-code={country.code}
                                                        onClick={() => {
                                                            setBilling(prev => ({ ...prev, country: country.code }))
                                                            setCountryOpen(false)
                                                        }}
                                                    >
                                                        {country.name}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <input type="hidden" id="country" name="country" value={billing.country} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Irányítószám</label>
                                <input className={fieldClass(billing.zip)} name="zip" value={billing.zip} onChange={handleBillingChange} required />
                            </div>
                            <div className="col-md-8">
                                <label className="form-label">Város</label>
                                <input className={fieldClass(billing.city)} name="city" value={billing.city} onChange={handleBillingChange} required />
                            </div>
                            <div className="col-md-12">
                                <label className="form-label">Cím</label>
                                <input className={fieldClass(billing.address)} name="address" value={billing.address} onChange={handleBillingChange} placeholder="Utca, házszám" required />
                            </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                            <button type="button" className="btn btn-outline-light" id="back-1" onClick={() => goToStep(1)}><i className="bi bi-arrow-left" /> Vissza</button>
                            <div className="pay-actions">
                                <button id="to-step-3" className="btn btn-kk" type="submit">Tovább a fizetéshez <i className="bi bi-arrow-right" /></button>
                            </div>
                        </div>
                    </form>
                </section>

                {/* STEP 3 */}
                <section id="step-3" className={`about-panel p-3 mt-3 ${step !== 3 ? 'd-none' : ''}`}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h2 className="about-title m-0">Fizetés</h2>
                        <div className="text-end">
                            <div><small style={{ color: 'var(--h1Text)', fontWeight: 600 }}>Csomag: <strong id="summary-plan">{summaryPlanLabel}</strong></small></div>
                            <div><small style={{ color: 'var(--h1Text)', fontWeight: 600 }}>Fizetendő: <strong id="summary-price">{summaryPlanPrice}</strong></small></div>
                        </div>
                    </div>

                    <div className="row g-4">
                        <div className="col-lg-7">
                            <div className="about-panel p-3">
                                <h5 className="mb-3"><i className="bi bi-credit-card me-1" /> Bankkártya</h5>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label">Kártyaszám</label>
                                        <input className="form-control" id="cardNumber" name="number" placeholder="1111 2222 3333 4444" value={card.number} onChange={handleCardChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Lejárat</label>
                                        <input className="form-control" id="cardExp" name="exp" placeholder="MM/YY" value={card.exp} onChange={handleCardChange} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">CVC</label>
                                        <input className="form-control" id="cardCvc" name="cvc" placeholder="123" value={card.cvc} onChange={handleCardChange} />
                                    </div>
                                </div>
                                <button id="pay-card" className="btn btn-kk w-100 mt-3" type="button" onClick={payWithCard}>Fizetés kártyával</button>
                                <div className="mt-2 text-center security-note mx-auto"><i className="bi bi-shield-lock me-1" /> Titkosított kapcsolat • PCI-DSS</div>
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="about-panel p-3 alt-methods">
                                <h5 className="mb-3"><i className="bi bi-wallet2 me-1" /> Alternatív lehetőségek</h5>
                                <div className="d-grid gap-2">
                                    <button className="btn btn-outline-light" type="button" id="pay-apple" onClick={() => success('Apple Pay')}><i className="bi bi-apple me-1" /> Apple Pay</button>
                                    <button className="btn btn-outline-light" type="button" id="pay-google" onClick={() => success('Google Pay')}><i className="bi bi-phone me-1" /> Google Pay</button>
                                    <button className="btn btn-outline-light" type="button" id="pay-paypal" onClick={() => success('PayPal')}><i className="bi bi-paypal me-1" /> PayPal</button>
                                    <button className="btn btn-outline-light" type="button" id="pay-transfer" onClick={() => success('Átutalás')}><i className="bi bi-bank me-1" /> Banki átutalás</button>
                                </div>
                            </div>
                            <div className="about-panel p-3 mt-3">
                                <h6 className="mb-2">Mit kapsz az előfizetéssel?</h6>
                                <ul className="mb-0">
                                    <li>Reklámmentes élmény</li>
                                    <li>Korlátlan film- és könyv hozzáférés</li>
                                    <li>Offline letöltés</li>
                                    <li>Exkluzív tartalmak és integrációk</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <button className="btn btn-outline-light" id="back-2" type="button" onClick={() => goToStep(2)}><i className="bi bi-arrow-left" /> Vissza</button>
                        <Link to="/" className="btn btn-secondary">Mégsem</Link>
                    </div>
                </section>
            </main>

            {/* Payment Result Modal */}
            <div className={`payment-modal ${modalState.open ? 'show' : ''}`} id="paymentModal">
                <div className="payment-modal-content">
                    <div className={`payment-modal-icon ${modalState.success ? 'success' : 'error'}`} id="modalIcon">
                        {modalState.success ? <i className="bi bi-check-circle-fill" /> : <i className="bi bi-x-circle-fill" />}
                    </div>
                    <h3 className="payment-modal-title" id="modalTitle">{modalState.success ? 'Sikeres fizetés!' : 'Sikertelen fizetés'}</h3>
                    <p className="payment-modal-message" id="modalMessage">
                        {modalState.success
                            ? `Köszönjük az előfizetést ${modalState.method} módszerrel. Hamarosan emailben kapsz egy visszaigazolást.`
                            : 'A fizetés feldolgozása sikertelen volt. Kérjük, ellenőrizd az adatokat és próbáld újra.'}
                    </p>
                    <div className="payment-modal-transaction" id="modalTransaction">
                        {modalState.success ? (
                            <>
                                <small>Tranzakció azonosító:</small><br />
                                <strong>{modalState.txId}</strong>
                            </>
                        ) : (
                            <>
                                <small>Hibakód:</small><br />
                                <strong>{modalState.txId}</strong>
                            </>
                        )}
                    </div>
                    <button className="btn btn-kk payment-modal-btn" id="modalBtn" type="button" onClick={handleModalButton}>
                        Vissza a főoldalra
                    </button>
                </div>
            </div>
        </>
    )
}

export default Payment