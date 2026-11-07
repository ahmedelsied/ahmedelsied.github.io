---
title: "Sharing One File Across Filament Records"
description: "A file in Filament usually belongs to the record that uploaded it. This package keeps the file in one library and lets many records attach it."
date: 2026-11-03
lang: en
keywords:
  - filament
  - laravel
  - media library
  - spatie medialibrary
---

A file uploaded through Filament usually belongs to the record that received it. Use that cover on a second post and the panel either copies the file or cannot see it at all. [Filament Media Browser](https://github.com/ahmedelsied/filament-media-browser) keeps the file in one library. A record stores a link to it. Detaching the link removes the usage and leaves the file where it is, so the next record can attach the same one.

The package targets Filament 3.2, 4, and 5, on PHP 8.4 and Laravel 11, 12, or 13. It is published as `ahmedelsied/filament-media-browser` under the MIT license.

## Where the file is stored

There are two places the library can live, chosen once with `config('media-browser.driver')`.

The default driver is the right start for a new library. It stores files in `media_browser_files` and each use of a file in `media_browser_attachments`. Any Eloquent model can attach a file. Nothing else has to be added to the model.

The Spatie driver is for an application that already stores files with [spatie/laravel-medialibrary](https://github.com/spatie/laravel-medialibrary) 11 or newer. The library files are Spatie media owned by a single `media_pool` row, in the `library` collection. Each use is a row in `media_attachments`. A model that attaches those files implements Spatie's `HasMedia` and uses `InteractsWithPoolMedia`.

Switching drivers later means running the other driver's migration. Files are not copied across.

## Adding it to the panel

```bash
composer require ahmedelsied/filament-media-browser
php artisan media-browser:install
php artisan migrate
```

The install command asks one question: does this project already use Filament's Spatie media plugin? No publishes the default tables. Yes publishes `media_pool` and `media_attachments`, and it should be answered yes only when `spatie/laravel-medialibrary` 11 or newer is already installed. The command writes `config/media-browser.php`. If that file already exists, the other settings stay and only `driver` is updated.

The panel then registers the plugin:

```php
use AhmedElsied\FilamentMediaBrowser\MediaBrowserPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugins([
            MediaBrowserPlugin::make(),
        ]);
}
```

That adds an Image Browser at `/media-browser` and a Document Browser at `/document-browser`. Anyone who can open the panel can upload, inspect, and permanently delete a library file. Opening a file lists every record that uses it and links to that record's edit page, or its view page when the resource has no edit page. `linkTargetUsing`, `recordUrlUsing`, and `typeLabelUsing` change which model that link points at, which URL it uses, and the type name shown beside the title. An empty URL falls back to the model's Filament resource.

## Attaching a file from a form

`MediaBrowserField` opens the library. The editor picks a file that is already there or uploads a new one. Saving the form writes the attachment for that collection. The field does not add a column to the record.

```php
use AhmedElsied\FilamentMediaBrowser\Forms\Components\MediaBrowserField;

MediaBrowserField::make('cover')
    ->image()
    ->collection('cover');

MediaBrowserField::make('attachments')
    ->document()
    ->multiple()
    ->collection('attachments');
```

`image()` is the default: one JPEG, PNG, WebP, or SVG, up to 2048 KB. `document()` accepts a PDF, DOC, DOCX, PPT, PPTX, TXT, or CSV, up to 5120 KB. `multiple()` keeps more than one file, in the order the editor chose. `collection()` is the name used when the files are read back, and it defaults to the field name. `disk()` sets the disk for a new upload. On a view page the preview stays and the choose and remove actions are hidden.

## Reading the attachment back

The link is grouped by collection name, such as `cover` or `gallery`. The same calls work from an API resource, a job, or anywhere outside the form. `MediaLibrary::resolve()` returns whichever driver the config selected.

On the default driver no trait is required. `attachments()` returns the `MediaBrowserFile` models for that collection, in saved order. `syncAttachments()` replaces one collection and leaves every other collection on that record alone. The library files themselves are not deleted. Passing an empty list clears the collection.

```php
use AhmedElsied\FilamentMediaBrowser\MediaLibrary;

$library = MediaLibrary::resolve();

$uploaded = $library->storeUpload($upload, 'Homepage hero');
$currentCover = $library->attachments($post, 'cover')->first();

$library->syncAttachments($post, 'gallery', [
    $uploaded->getKey(),
    $currentCover->getKey(),
]);
```

`$upload` is an `Illuminate\Http\UploadedFile`. The id passed to `syncAttachments()` is `media_browser_files.id`.

On the Spatie driver the model looks like this:

```php
use AhmedElsied\FilamentMediaBrowser\Contracts\AttachesMedia;
use AhmedElsied\FilamentMediaBrowser\Traits\InteractsWithPoolMedia;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;

class Post extends Model implements AttachesMedia, HasMedia
{
    use InteractsWithPoolMedia;
}
```

`getFirstMedia()` and `getMedia()` then return the library files for a collection, in order. If that collection has no library usage, both fall back to media the model owns directly, including a file uploaded with Filament's own Spatie field. `clearMediaCollection()` deletes only those owned files. It does not delete a file that still lives in the library.

`syncAttachedMedia()` takes Spatie `media.id` values from `getKey()`. The uuid shown in the picker is a different value, so a uuid has to be loaded with `findFiles()` before it can be synced. `attachMedia()` adds one file. `detachMediaCollection()` removes that collection's links and leaves the files in the library.

`MediaLibrary::resolve()->syncAttachments()` does the same replacement on either driver. On the Spatie driver the model still has to use `InteractsWithPoolMedia`.

## The URL a visitor receives

`PreviewUrl::for()` returns the public URL, or a temporary URL when the disk is a private cloud disk. `getUrl()` is the plain disk URL, and on a Spatie media model that means Spatie's own URL.

```php
use AhmedElsied\FilamentMediaBrowser\Support\PreviewUrl;

$cover = $library->attachments($post, 'cover')->first();

return [
    'cover' => $cover ? PreviewUrl::for($cover) : null,
];
```

On the Spatie driver the same helper accepts the model returned by `getFirstMedia()` or `getMedia()`.

Two settings in `config/media-browser.php` decide the rest. `driver` is `default` or `spatie`, and `Driver::current()` reads it in code. `disk` defaults to `public` for the default driver. The Spatie driver uses `config('media-library.disk_name')` instead. Interface strings ship in English and Arabic and follow the application locale.
