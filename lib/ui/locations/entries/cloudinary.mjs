/**
## /ui/locations/entries/cloudinary

The cloudinary module exports a method to upload or destroy resources with signed requests on cloudinary.

The exported method creates an interface in the location view with input for images and documents.

@requires /utils/xhr
@requires /utils/imagePreview

@module /ui/locations/entries/cloudinary
*/

const types = {
  image,
  images,
  documents,
};

export default (entry) => types[entry.type](entry);

/**
@function image

@description
The image entry.type function returns an image with a button to detroy the image the entry has a value and is editable.

@param {Object} entry 
@property {string} entry.value An existing cloudinary resource URL.
@property {Object} entry.edit The entry is editable.

@returns {HTMLElement} Returns either an image element or an input element to upload an image.
*/
function image(entry) {
  if (entry.value) {
    // The trash button will only be created when entry is editable.
    const trashBtn =
      entry.edit &&
      mapp.utils.html`<button title="${mapp.dictionary.delete}"
      class="material-symbols-outlined no-colour delete"
      data-name=${entry.value.replace(/^.*\//, '').replace(/\.([\w-]{3})/, '')}
      data-src=${entry.value}
      onclick=${(e) => trash(e, entry, mapp.dictionary.remove_image_confirm)}>`;

    return mapp.utils.html.node`<div class="img-item">
      <img
        style="width: 100%"
        src=${entry.value}
        onclick=${mapp.ui.utils.imagePreview}>
        ${trashBtn}`;
  } else if (entry.edit) {
    // Return image upload input for editable entry without a value.
    return mapp.utils.html.node`<div class="drag_and_drop_zone"
    ondrop=${(e) => {
      e.preventDefault();
      upload(e, { ...entry, ...{ file: e.dataTransfer.files?.[0] } });
    }}
    ondragover=${(e) => {
      e.preventDefault();
    }}>
    <p><span class="material-symbols-outlined add"/>${mapp.dictionary.drag_and_drop_image}</p>
    <input
    type="file"
    accept="image/*;capture=camera" onchange=${(e) => {
      upload(e, entry);
    }}>`;
  }
}

/**
@function images

@description
The images entry.type function returns an image-grid element of images with the ability to destroy resources if the entry is editable. An input is show to upload additional images if the entry is editable.

@param {Object} entry 
@property {Array} entry.value An array of existing cloudinary resource URLs.
@property {Object} entry.edit The entry is editable.
@returns {HTMLElement} A grid element with existing images and an input to upload additional images on editable entry.
*/
function images(entry) {
  const images = [];

  entry.value?.map((image) => {
    // The trash button will only be created when entry is editable.
    const trashBtn =
      entry.edit &&
      mapp.utils.html`<button title="${mapp.dictionary.delete}"
      class="material-symbols-outlined no-colour delete"
      data-name=${image.replace(/^.*\//, '').replace(/\.([\w-]{3})/, '')}
      data-src=${image}
      onclick=${(e) => trash(e, entry, mapp.dictionary.remove_image_confirm)}>`;

    images.push(mapp.utils.html`<div class="img-item"><img 
      src=${image}
      onclick=${mapp.ui.utils.imagePreview}>
      ${trashBtn}`);
  });

  // Push upload input into images array.

  if (entry.edit) {
    const drap_and_drop_zone = mapp.utils.html
      .node`<div class="drag_and_drop_zone"
    ondrop=${(e) => {
      e.preventDefault();
      upload(e, { ...entry, ...{ file: e.dataTransfer.files?.[0] } });
    }}
    ondragover=${(e) => {
      e.preventDefault();
    }}>
    <p><span class="material-symbols-outlined add"/>${mapp.dictionary.drag_and_drop_image}</p>
    <input
    type="file"
    accept="image/*;capture=camera" onchange=${(e) => {
      upload(e, entry);
    }}>`;

    images.push(drap_and_drop_zone);
  }

  if (!images.length) return;

  return mapp.utils.html.node`<div class="images-grid">${images}`;
}

/**
@function documents

@description
The documents entry.type function returns an document-list element of documents with the ability to destroy resources if the entry is editable. An input is show to upload additional documents if the entry is editable.

@param {Object} entry 
@returns {HTMLElement} A list element with existing documents and an input to upload additional documents on editable entry.
 */
function documents(entry) {
  const docs = [];

  entry.value?.map((doc) => {
    const trashBtn =
      entry.edit &&
      mapp.utils.html`<button title="${mapp.dictionary.delete}"
      class="material-symbols-outlined no-colour delete"
      data-name=${doc.replace(/^.*\//, '').replace(/\.([\w-]{3})/, '')}
      data-href=${doc}
      onclick=${(e) => trash(e, entry, mapp.dictionary.remove_document_confirm)}>`;

    docs.push(mapp.utils.html`<div class="link-with-img">
      ${trashBtn}<a target="_blank" href=${doc}>${doc.replace(/^.*\//, '').replace(/\.([\w-]{3})/, '')}`);
  });

  if (entry.edit) {
    const drag_and_drop_zone = mapp.utils.html
      .node`<div class="drag_and_drop_zone"
      ondrop=${(e) => {
        e.preventDefault();
        upload(e, { ...entry, ...{ file: e.dataTransfer.files?.[0] } });
      }}
      ondragover=${(e) => {
        e.preventDefault();
      }}>
       <p><span class="material-symbols-outlined add-doc"/>${mapp.dictionary.drag_and_drop_doc}</p>
       <input type="file"
       accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document;"
       onchange=${(e) => upload(e, entry)}>`;

    docs.unshift(drag_and_drop_zone);
  }

  if (!docs.length) return;

  return mapp.utils.html.node`<div>${docs}`;
}

/**
@function upload

@description
The upload event can be assigned to the onchange event of an input to upload the resource selected in the input element.

@param {event} e The onchange event from the input element to select a resource.
@param {Object} entry  
*/
async function upload(e, entry) {
  // Location view must disabled while uploading resource.
  entry.location.view?.classList.add('disabled');

  const reader = new FileReader();

  entry.file ??= e.target.files[0];

  if (!entry.file) return;

  const onload = {
    image: imageLoad,
    images: imageLoad,
    documents: docLoad,
  };

  reader.onload = (e) => onload[entry.type](e, entry);

  reader.readAsDataURL(entry.file);
}

/**
@function imageLoad

@description
The imageLoad function handles the loading and processing of an image file.

@param {event} e 
@param {Object} entry 
*/
function imageLoad(e, entry) {
  const img = new Image();

  img.onload = async () => {
    const canvas = mapp.utils.html.node`<canvas>`;
    const max_size = 1024;

    let width = img.width,
      height = img.height;

    // resize
    if (width > height && width > max_size) {
      height *= max_size / width;
      width = max_size;
    } else if (height > max_size) {
      width *= max_size / height;
      height = max_size;
    }

    canvas.width = width;
    canvas.height = height;

    canvas.getContext('2d').drawImage(img, 0, 0, width, height);

    const public_id =
      entry.file.name.replace(/^.*\//, '').replace(/\.([\w-]{3})/, '') +
      entry.suffix_date
        ? `@${Date.now()}`
        : '';

    const signedUrl = await getSignedUrl(entry, { public_id });

    // Failed to generate a signedUrl for the request.
    if (!signedUrl) return;

    const data = new FormData();

    data.append('file', canvas.toDataURL('image/jpeg', 0.5));

    const response = await fetch(signedUrl, {
      method: 'post',
      body: data,
    });

    if (!response || response.error) {
      const errorDetail = response?.error?.message
        ? `Error: ${response.error.message}`
        : '';
      const errorMessage = `Cloudinary Image upload failed! ${errorDetail}`;
      mapp.ui.elements.alert({ text: errorMessage });
      return;
    }

    const responseJson = await response.json();

    if (entry.type === 'image') {
      // Only a single image is supported by the entry.type.
      entry.value = responseJson.secure_url;
    } else {
      // Add the secure_url to the entry values array and update the location.
      entry.value = Array.isArray(entry.value)
        ? entry.value.concat([responseJson.secure_url])
        : [responseJson.secure_url];
    }

    updateLocation(entry);
  };

  img.src = e.target.result;
}

/**
@function docLoad

@description
The docLoad method handles the upload of document files to via signed URL to cloudinary.

@param {event} e 
@param {Object} entry 
*/
async function docLoad(e, entry) {
  const date = new Date();
  const stamp = `${date.getMonth() + 1}-${date.getDate()}T${date.getHours()}:${date.getMinutes()}`;
  const file_type = entry.file.name.substring(entry.file.name.lastIndexOf('.'));
  const public_id = `${entry.file.name.replace(file_type, '')}-${stamp}${file_type}`;

  const signedUrl = await getSignedUrl(entry, { public_id });

  // Failed to generate a signedUrl for the request.
  if (!signedUrl) return;

  const data = new FormData();

  data.append('file', e.target.result.toString());

  const response = await fetch(signedUrl, {
    method: 'post',
    body: data,
  });

  if (!response || response.error) {
    const errorDetail = response?.error?.message
      ? `Error: ${response.error.message}`
      : '';

    mapp.ui.elements.alert(`Cloudinary document upload failed! ${errorDetail}`);
    return;
  }

  // Add the secure_url to the entry values array and update the location.
  const responseJson = await response.json();

  entry.value = Array.isArray(entry.value)
    ? entry.value.concat([responseJson.secure_url])
    : [responseJson.secure_url];

  updateLocation(entry);
}

/**
@function trash

@description
The trash function handles the deletion an image file.

@param {event} e 
@param {Object} entry 
*/
async function trash(e, entry, confirm_message) {
  const confirm_remove = await mapp.ui.elements.confirm({
    text: confirm_message,
  });

  if (!confirm_remove) return;

  const public_id = decodeURIComponent(e.target.dataset.name);

  const signedUrl = await getSignedUrl(entry, { public_id, destroy: true });

  // Failed to generate a signedUrl for the request.
  if (!signedUrl) return;

  // Send request to cloudinary to destroy resource.
  await fetch(signedUrl, { method: 'post' });

  // Remove the resource link from the entry values array and update the location.
  const valueSet = new Set(entry.value);

  valueSet.delete(e.target.dataset.src || e.target.dataset.href);

  if (entry.type === 'image') {
    entry.value = null;
  } else {
    entry.value = valueSet.size ? Array.from(valueSet) : null;
  }

  updateLocation(entry);
}

/**
@function updateLocation 

@description
The method disables the location view before updating the location data and re-creating the cloudinary entry.type interface.

@param {Object} entry
@property {HTMLElement} entry.node The location view element which holds the cloudinary interface elements.
*/
async function updateLocation(entry) {
  entry.location.view?.classList.add('disabled');

  await mapp.utils.xhr({
    method: 'POST',
    url:
      `${entry.location.layer.mapview.host}/api/query?` +
      mapp.utils.paramString({
        template: 'location_update',
        locale: entry.location.layer.mapview.locale.key,
        layer: entry.location.layer.key,
        table: entry.location.table,
        id: entry.location.id,
      }),
    body: JSON.stringify({ [entry.field]: entry.value }),
  });

  // Render the type interface into the location view entry.node
  entry.node.replaceChildren(
    mapp.utils.html.node`<div class="label">${entry.title}`,
    types[entry.type](entry),
  );

  entry.location.view?.classList.remove('disabled');
}

/**
@function getSignedUrl
@async
@description
Signs a parameterised request to upload or destroy a resource on cloudinary.

@param {Object} entry 
@param {Object} params 
@property {string} entry.cloudinary_folder
@property {string} params.public_id
@property {boolean} [params.destroy] The request is to detroy a stored resource.

@returns {Promise<String>} signedURL
*/
async function getSignedUrl(entry, params) {
  const paramString = mapp.utils.paramString({
    ...params,
    folder: entry.cloudinary_folder,
  });

  const signedUrl = await mapp.utils.xhr({
    url: `${entry.location.layer.mapview.host}/api/sign/cloudinary?${paramString}`,
    responseType: 'text',
  });

  if (signedUrl instanceof Error) {
    console.error(signedUrl);
  }

  return signedUrl;
}
