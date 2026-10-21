import { Router } from 'express';
import {
  getLegalDocument,
  renderDeleteAccountHtml,
  renderLegalHtml,
  type LegalDocId,
} from '../content/legal';

export const legalRouter = Router();

function sendDoc(res: import('express').Response, id: LegalDocId) {
  const html = renderLegalHtml(getLegalDocument(id));
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(html);
}

legalRouter.get('/privacy', (_req, res) => sendDoc(res, 'privacy'));
legalRouter.get('/terms', (_req, res) => sendDoc(res, 'terms'));

legalRouter.get('/delete-account', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(renderDeleteAccountHtml());
});

legalRouter.get('/', (_req, res) => {
  res.json({
    privacy: '/legal/privacy',
    terms: '/legal/terms',
    deleteAccount: '/legal/delete-account',
  });
});
