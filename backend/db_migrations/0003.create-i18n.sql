create table i18n (
  locale_key VARCHAR , 
  locale VARCHAR(8), 
  content_id int, 
  content text,
  PRIMARY KEY(locale_key, locale));

INSERT INTO public.i18n
(locale_key, locale, "content", content_id)
VALUES('quest_content', 'en', 'Something else', 1);
INSERT INTO public.i18n
(locale_key, locale, "content", content_id)
VALUES('quest_content', 'de', 'Schau dir den Planungsraum an und nutze das Linien-Werkzeug, um eine Route einzuzeichnen, die du regelmäßig benutzt, um dich im Planungsgebiet zu bewegen.', 1);
