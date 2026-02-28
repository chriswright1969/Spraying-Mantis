import 'dotenv/config';

import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import { sendContactMail } from '/src/mailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
const PORT = Number(process.env.PORT || 3000);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

function env(name, fallback = '') {
  return String(process.env[name] || fallback).trim();
}

function boolEnv(name, fallback = false) {
  const value = String(process.env[name] ?? '').trim().toLowerCase();
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value);
}

function getSite() {
  const email = env('EMAIL', 'nathan@sprayingmantis.co.uk');

  return {
    name: env('SITE_NAME', 'Spraying Mantis Auto Repairs'),
    phone: env('PHONE', '07976 617629'),
    phoneHref: env('PHONE_HREF', '07976617629'),
    email,
    instagramUrl: env('INSTAGRAM_URL', 'https://www.instagram.com/sprayingmantisautos'),
    instagramHandle: env('INSTAGRAM_HANDLE', '@sprayingmantisautos'),
    domain: env('DOMAIN', 'https://sprayingmantis.co.uk'),
    coverageArea: env('COVERAGE_AREA', 'Ellesmere, Shropshire and surrounding areas'),
    addressLine1: env('ADDRESS_LINE_1', 'Unit 1, Example Trade Estate'),
    addressLine2: env('ADDRESS_LINE_2', 'Ellesmere, SY12 0AA'),
    openingHours: env('OPENING_HOURS', 'Mon-Fri 8:00am-5:00pm'),
    logo: env('DEFAULT_LOGO', '/public/logo2.png'),
    formRecipient: env('FORM_RECIPIENT', email)
  };
}

const services = [
  {
    title: 'Accident repairs',
    text: 'From bumper damage to more extensive panel work, repairs are carried out with care and attention to finish.'
  },
  {
    title: 'Paintwork & resprays',
    text: 'Panel resprays, refinishing and colour-matched paintwork to restore appearance and protect value.'
  },
  {
    title: 'Bumper, dent & scratch repair',
    text: 'Ideal for cosmetic damage, scuffs and everyday knocks that spoil the look of your car or van.'
  },
  {
    title: 'Insurance & private work',
    text: 'Suitable for both insurance-related repairs and direct private estimates for self-funded jobs.'
  },
  {
    title: 'Commercial vehicles',
    text: 'Body repairs and paintwork support for vans and light commercial vehicles that need to stay presentable.'
  },
  {
    title: 'Free estimates',
    text: 'Clear advice on likely work, next steps and how best to get your vehicle booked in.'
  }
];

const processSteps = [
  {
    no: '01',
    title: 'Get in touch',
    text: 'Call, email or message through Instagram with details of the damage and your vehicle.'
  },
  {
    no: '02',
    title: 'Receive an estimate',
    text: 'Get practical guidance on the repair required and the likely next steps.'
  },
  {
    no: '03',
    title: 'Book the work',
    text: 'Agree timing and arrange for the job to be completed to a high standard.'
  },
  {
    no: '04',
    title: 'Collect with confidence',
    text: 'Your vehicle leaves looking sharper, smarter and ready for the road again.'
  }
];

const reasons = [
  'Experienced bodyshop-style repair work for cars and vans',
  'Needs some blurb for this bit',
  'Needs some blurb for this bitm',
  'Needs some blurb for this bit',
  'Needs some blurb for this bit',
  'Needs some blurb for this bit'
];

const galleryItems = [
  {
    label: 'Repair example 1',
    title: 'Bumper scuff repair',
    text: 'Need a picture for here.'
  },
  {
    label: 'Repair example 2',
    title: 'Panel respray & colour match',
    text: 'Need a picture for here.'
  },
  {
    label: 'Repair example 3',
    title: 'Van bodywork repair',
    text: 'Need a picture for here.'
  }
];

const reviews = [
  {
    name: 'B. Swollocks',
    text: 'Excellent repair and a really tidy finish. Friendly communication throughout and very professional.'
  },
  {
    name: 'B. Dover',
    text: 'Brilliant result after accident damage. Paint match looked spot on and the vehicle came back looking superb.'
  },
  {
    name: 'Al Colick',
    text: 'Quick estimate, honest advice and a high-quality job. Would happily recommend Spraying Mantis Auto Repairs.'
  }
];

function getNotice(query) {
  const status = String(query.status || '').trim().toLowerCase();
  if (status === 'sent') {
    return {
      type: 'success',
      text: 'Thanks — your enquiry has been sent. We will be in touch as soon as possible.'
    };
  }
  if (status === 'logged') {
    return {
      type: 'success',
      text: 'Thanks — your enquiry was received. Email delivery needs to be configured, so it was logged on the server instead.'
    };
  }
  if (status === 'error') {
    return {
      type: 'error',
      text: 'Sorry — there was a problem sending your enquiry. Please call, email, or try again shortly.'
    };
  }
  if (status === 'missing') {
    return {
      type: 'error',
      text: 'Please provide your name, a phone number or email address, and a short message about the repair needed.'
    };
  }
  return null;
}

function renderHome(req, res, formData = {}) {
  return res.render('index', {
    title: getSite().name,
    site: getSite(),
    services,
    processSteps,
    reasons,
    galleryItems,
    reviews,
    notice: getNotice(req.query),
    formData
  });
}

app.get('/', (req, res) => {
  renderHome(req, res);
});

app.post('/contact', async (req, res) => {
  const site = getSite();

  const name = String(req.body?.name || '').trim();
  const phone = String(req.body?.phone || '').trim();
  const email = String(req.body?.email || '').trim();
  const message = String(req.body?.message || '').trim();

  if (!name || !message || (!phone && !email)) {
    return res.status(400).render('index', {
      title: site.name,
      site,
      services,
      processSteps,
      reasons,
      galleryItems,
      reviews,
      notice: getNotice({ status: 'missing' }),
      formData: { name, phone, email, message }
    });
  }

  // Keep your existing “log instead of fail” behaviour until SMTP is configured
  const smtpHost = env('SMTP_HOST');
  const smtpUser = env('SMTP_USER');
  const smtpPass = env('SMTP_PASS');

  try {
    if (smtpHost && smtpUser && smtpPass) {
      await sendContactMail({ name, phone, email, message });
      return res.redirect('/?status=sent#contact');
    }

    console.log('--- Contact enquiry received (email not configured) ---');
    console.log({ name, phone, email, message, receivedAt: new Date().toISOString() });
    console.log('------------------------------------------------------');

    return res.redirect('/?status=logged#contact');
  } catch (error) {
    console.error('Contact form send failed:', error);
    return res.redirect('/?status=error#contact');
  }
});

app.get('/healthz', (_req, res) => {
  res.status(200).send('ok');
});

app.use((_req, res) => {
  res.status(404).redirect('/');
});

app.listen(PORT, () => {
  console.log(`Spraying Mantis Auto Repairs running on port ${PORT}`);
});
