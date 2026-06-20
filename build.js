#!/usr/bin/env node
// build.js — injects the shared <head> and <header> partials into every page.
//
// The HTML files are committed fully-rendered (so they work without a build
// step and stay directly viewable). Run `node build.js` after editing anything
// in partials/ or the PAGES config below to re-sync all pages.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SITE_URL = 'https://snnbench.com';

const headTemplate = fs.readFileSync(path.join(ROOT, 'partials/head.html'), 'utf8');
const headerPartial = fs.readFileSync(path.join(ROOT, 'partials/header.html'), 'utf8').replace(/\n$/, '');

const CONTACT_CSS = '\n    <link rel="stylesheet" type="text/css" href="/css/contact_form.css">';

// Per-page SEO metadata. Title/description feed <title>, <meta description>,
// Open Graph and Twitter tags; the canonical/og URL is derived from the key.
const PAGES = {
  'index.html': {
    title: 'SNN Benchmarks',
    description: 'Public benchmarking for Spiking Neural Networks — accuracy, neuron counts and learning approaches from leading research papers.',
  },
  'background.html': {
    title: 'Background — SNN Benchmarks',
    description: 'Background on spiking neural networks: biological foundations, learning approaches, neuron models, architectures, implementation and applications.',
  },
  'contact.html': {
    title: 'Contact — SNN Benchmarks',
    description: 'Get in touch to contribute a model to the SNN benchmarks or to discuss spiking neural networks.',
    extraHead: CONTACT_CSS,
  },
  'background/biological_foundations.html': {
    title: 'Biological Foundations — SNN Benchmarks',
    description: 'The biological concepts that inspire spiking neural networks: neural anatomy, action potentials, synaptic transmission and temporal coding.',
  },
  'background/learning_approaches.html': {
    title: 'Learning Approaches — SNN Benchmarks',
    description: 'Approaches to learning in spiking neural networks and how they are categorised on the SNN benchmarks.',
  },
  'background/neuron_models.html': {
    title: 'Neuron Models — SNN Benchmarks',
    description: 'Popular spiking neuron models, from leaky integrate-and-fire to more biologically detailed formulations.',
  },
  'background/network_architectures.html': {
    title: 'Network Architectures — SNN Benchmarks',
    description: 'SNN architectures including feed-forward, recurrent, reservoir computing and hybrid configurations.',
  },
  'background/implementation.html': {
    title: 'Implementation — SNN Benchmarks',
    description: 'Practical aspects of implementing SNNs: neuromorphic hardware, simulation frameworks, optimisation and benchmarking methodology.',
  },
  'background/applications.html': {
    title: 'Applications — SNN Benchmarks',
    description: 'Real-world applications of spiking neural networks across computer vision, speech processing, robotics and neuromorphic computing.',
  },
  'background/challenges.html': {
    title: 'Challenges and Future Directions — SNN Benchmarks',
    description: 'Current limitations, open research questions and emerging trends shaping the future of spiking neural networks.',
  },
};

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const pageUrl = (key) => (key === 'index.html' ? `${SITE_URL}/` : `${SITE_URL}/${key}`);

const renderHead = (meta, url) =>
  headTemplate
    .replace(/\{\{TITLE\}\}/g, escapeAttr(meta.title))
    .replace(/\{\{DESCRIPTION\}\}/g, escapeAttr(meta.description))
    .replace(/\{\{URL\}\}/g, url)
    .replace(/\{\{EXTRA_HEAD\}\}/g, meta.extraHead || '');

const HEAD_RE = /[ \t]*<head>[\s\S]*?<\/head>/;
const HEADER_RE = /[ \t]*<header>[\s\S]*?<\/header>/;

let changed = 0;
for (const [key, meta] of Object.entries(PAGES)) {
  const file = path.join(ROOT, key);
  if (!fs.existsSync(file)) {
    console.warn(`! skipped (missing): ${key}`);
    continue;
  }

  const original = fs.readFileSync(file, 'utf8');
  const head = `  <head>\n${renderHead(meta, pageUrl(key))}  </head>`;

  let updated = original;
  if (HEAD_RE.test(updated)) updated = updated.replace(HEAD_RE, head);
  else console.warn(`! no <head> found in ${key}`);

  if (HEADER_RE.test(updated)) updated = updated.replace(HEADER_RE, headerPartial);
  else console.warn(`! no <header> found in ${key}`);

  if (updated !== original) {
    fs.writeFileSync(file, updated);
    changed += 1;
    console.log(`✓ built ${key}`);
  } else {
    console.log(`· unchanged ${key}`);
  }
}

console.log(`\nDone — ${changed} file(s) updated.`);
