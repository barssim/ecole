import React, { useEffect, useMemo, useState } from "react";
import fr from "../locales/fr.json";
import ar from "../locales/ar.json";
import en from "../locales/en.json";
import { getSchoolId } from "../school";
import { hasAnyRole, normalizeRoles } from "../utils/roles";
import { createApiUrlFor, readJsonResponse } from "../utils/apiClient";
import { resolveApiBaseUrl } from "../utils/apiBaseUrl";

const API_BASE = resolveApiBaseUrl();

const resolveFileUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
};

const AuthImage = ({ url, headers, alt, onClick, className }) => {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;

    const load = async () => {
      if (!url) return;
      try {
        const response = await fetch(resolveFileUrl(url), { headers });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setSrc(objectUrl);
      } catch {
        if (!cancelled) setSrc("");
      }
    };

    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (!src) return <span className="gallery-album-cover-placeholder">📷</span>;

  return <img src={src} alt={alt} onClick={onClick} className={className} />;
};

const GalleryPage = ({ language }) => {
  const content = language === "fr" ? fr : language === "en" ? en : ar;
  const isArabic = language === "ar";

  const userRoles = JSON.parse(localStorage.getItem("user_roles") || "[]");
  const normalizedRoles = normalizeRoles(userRoles);
  const rolesHeader = normalizedRoles.join(",");
  const canManageGallery = hasAnyRole(normalizedRoles, ["admin", "manager"]);
  const userName = localStorage.getItem("LoggedIn") || "";
  const token = sessionStorage.getItem("jwt_token");
  const apiUrlFor = createApiUrlFor("http://localhost:8085");

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      "X-School-Id": getSchoolId(),
      "X-User-Roles": rolesHeader,
      "X-User-Name": userName,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token, userName, rolesHeader]
  );

  const uploadHeaders = useMemo(
    () => ({
      "X-School-Id": getSchoolId(),
      "X-User-Roles": rolesHeader,
      "X-User-Name": userName,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token, userName, rolesHeader]
  );

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [albumForm, setAlbumForm] = useState({ title: "", description: "" });
  const [deleteAlbumConfirm, setDeleteAlbumConfirm] = useState(null);

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletePhotoConfirm, setDeletePhotoConfirm] = useState(null);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(apiUrlFor("/gallery/albums"), { headers });
      const data = await readJsonResponse(response, content.gallery_error || "Unable to load gallery");
      setAlbums(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error while loading gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPhotos = async (album) => {
    try {
      setPhotosLoading(true);
      setError("");
      const response = await fetch(apiUrlFor(`/gallery/albums/${album.id}/photos`), { headers });
      const data = await readJsonResponse(response, content.gallery_error || "Unable to load photos");
      setPhotos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error while loading photos");
    } finally {
      setPhotosLoading(false);
    }
  };

  const openAlbum = (album) => {
    setSelectedAlbum(album);
    setPhotos([]);
    setMessage("");
    setError("");
    setUploadFile(null);
    setUploadCaption("");
    fetchPhotos(album);
  };

  const backToAlbums = () => {
    setSelectedAlbum(null);
    setPhotos([]);
    setMessage("");
    setError("");
  };

  const openCreateAlbum = () => {
    setError("");
    setMessage("");
    setAlbumForm({ title: "", description: "" });
    setShowCreateAlbum(true);
  };

  const handleAlbumFormChange = (e) => {
    setAlbumForm({ ...albumForm, [e.target.name]: e.target.value });
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!canManageGallery) return;
    try {
      setError("");
      setMessage("");
      const response = await fetch(apiUrlFor("/gallery/albums"), {
        method: "POST",
        headers,
        body: JSON.stringify(albumForm),
      });
      if (!response.ok) {
        throw new Error(content.gallery_album_error || "Unable to create album");
      }
      setMessage(content.gallery_album_created || "Album créé avec succès");
      setShowCreateAlbum(false);
      setAlbumForm({ title: "", description: "" });
      fetchAlbums();
    } catch (err) {
      setError(err.message || "Unable to create album");
    }
  };

  const handleDeleteAlbum = async (id) => {
    if (!canManageGallery) return;
    try {
      setError("");
      setMessage("");
      const response = await fetch(apiUrlFor(`/gallery/albums/${id}`), {
        method: "DELETE",
        headers,
      });
      if (!response.ok) {
        throw new Error(content.gallery_album_delete_error || "Unable to delete album");
      }
      setDeleteAlbumConfirm(null);
      setMessage(content.gallery_album_deleted || "Album supprimé avec succès");
      if (selectedAlbum && selectedAlbum.id === id) {
        backToAlbums();
      }
      fetchAlbums();
    } catch (err) {
      setError(err.message || "Unable to delete album");
    }
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    if (!canManageGallery || !selectedAlbum || !uploadFile) return;
    try {
      setUploading(true);
      setError("");
      setMessage("");
      const formData = new FormData();
      formData.append("file", uploadFile);
      if (uploadCaption.trim()) {
        formData.append("caption", uploadCaption.trim());
      }
      const response = await fetch(apiUrlFor(`/gallery/albums/${selectedAlbum.id}/photos`), {
        method: "POST",
        headers: uploadHeaders,
        body: formData,
      });
      if (!response.ok) {
        throw new Error(content.gallery_photo_error || "Unable to upload photo");
      }
      setMessage(content.gallery_photo_added || "Photo ajoutée avec succès");
      setUploadFile(null);
      setUploadCaption("");
      fetchPhotos(selectedAlbum);
      fetchAlbums();
    } catch (err) {
      setError(err.message || "Unable to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (id) => {
    if (!canManageGallery || !selectedAlbum) return;
    try {
      setError("");
      setMessage("");
      const response = await fetch(apiUrlFor(`/gallery/photos/${id}`), {
        method: "DELETE",
        headers,
      });
      if (!response.ok) {
        throw new Error(content.gallery_photo_delete_error || "Unable to delete photo");
      }
      setDeletePhotoConfirm(null);
      setMessage(content.gallery_photo_deleted || "Photo supprimée avec succès");
      fetchPhotos(selectedAlbum);
      fetchAlbums();
    } catch (err) {
      setError(err.message || "Unable to delete photo");
    }
  };

  return (
    <div className="activity-page" dir={isArabic ? "rtl" : "ltr"} style={{ textAlign: isArabic ? "right" : "left" }}>
      <div className="activity-header">
        <div>
          <span className="activity-title-badge">{content.gallery_badge || "Galerie"}</span>
          <h1 className="activity-title">
            {selectedAlbum ? selectedAlbum.title : (content.gallery_title || "Photos et Albums")}
          </h1>
        </div>
        <div className="activity-toolbar">
          {selectedAlbum && (
            <button type="button" className="activity-btn" onClick={backToAlbums}>
              {content.gallery_back_to_albums || "Retour aux albums"}
            </button>
          )}
          {!selectedAlbum && canManageGallery && (
            <button type="button" className="activity-btn activity-btn-primary" onClick={openCreateAlbum}>
              {content.gallery_add_album || "Créer un album"}
            </button>
          )}
        </div>
      </div>

      {message && <p className="activity-message activity-message-success">{message}</p>}
      {error && <p className="activity-message activity-message-error">{error}</p>}

      {!selectedAlbum && canManageGallery && showCreateAlbum && (
        <div className="activity-card">
          <h3>{content.gallery_add_album || "Créer un album"}</h3>
          <form onSubmit={handleCreateAlbum} className="activity-form">
            <input
              name="title"
              value={albumForm.title}
              onChange={handleAlbumFormChange}
              placeholder={content.gallery_album_title || "Titre de l'album"}
              required
            />
            <textarea
              name="description"
              value={albumForm.description}
              onChange={handleAlbumFormChange}
              placeholder={content.outing_description || "Description"}
            />
            <button type="submit" className="activity-form-submit">
              {content.gallery_add_album || "Créer un album"}
            </button>
          </form>
        </div>
      )}

      {!selectedAlbum && (
        loading ? (
          <p className="activity-loading">{content.loading || "Loading..."}</p>
        ) : albums.length === 0 ? (
          <div className="activity-empty">{content.gallery_no_albums || "Aucun album pour le moment."}</div>
        ) : (
          <div className="gallery-album-grid services-records-scroll">
            {albums.map((album) => (
              <div key={album.id} className="gallery-album-card" onClick={() => openAlbum(album)}>
                <div className="gallery-album-cover">
                  {album.coverPhotoUrl ? (
                    <AuthImage url={album.coverPhotoUrl} headers={headers} alt={album.title} />
                  ) : (
                    <span className="gallery-album-cover-placeholder">📷</span>
                  )}
                </div>
                <div className="gallery-album-info">
                  <h3>{album.title}</h3>
                  <span className="gallery-album-count">
                    {album.photoCount} {content.gallery_photos_count_label || "photo(s)"}
                  </span>
                  {album.description && <p>{album.description}</p>}
                </div>
                {canManageGallery && (
                  <div className="activity-item-actions" onClick={(e) => e.stopPropagation()}>
                    {deleteAlbumConfirm === album.id ? (
                      <>
                        <button
                          type="button"
                          className="activity-icon-btn activity-icon-confirm"
                          onClick={() => handleDeleteAlbum(album.id)}
                          title={content.exam_confirmDelete || "Confirmer"}
                        >
                          ✔
                        </button>
                        <button
                          type="button"
                          className="activity-icon-btn activity-icon-cancel"
                          onClick={() => setDeleteAlbumConfirm(null)}
                          title={content.activity_cancel_button || "Annuler"}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="activity-icon-btn activity-icon-delete"
                        onClick={() => setDeleteAlbumConfirm(album.id)}
                        title={content.outing_remove_button || "Remove"}
                      >
                        🗑
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {selectedAlbum && (
        <>
          {canManageGallery && (
            <div className="activity-card">
              <h3>{content.gallery_add_photo || "Ajouter une photo"}</h3>
              <form onSubmit={handleUploadPhoto} className="activity-form">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required
                />
                <input
                  name="caption"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder={content.gallery_photo_caption || "Légende (optionnel)"}
                />
                <button type="submit" className="activity-form-submit" disabled={uploading || !uploadFile}>
                  {uploading
                    ? (content.gallery_uploading || "Envoi en cours...")
                    : (content.gallery_add_photo || "Ajouter une photo")}
                </button>
              </form>
            </div>
          )}

          {photosLoading ? (
            <p className="activity-loading">{content.loading || "Loading..."}</p>
          ) : photos.length === 0 ? (
            <div className="activity-empty">{content.gallery_no_photos || "Aucune photo dans cet album."}</div>
          ) : (
            <div className="gallery-photo-grid services-records-scroll">
              {photos.map((photo) => (
                <div key={photo.id} className="gallery-photo-card">
                  <AuthImage
                    url={photo.url}
                    headers={headers}
                    alt={photo.caption || ""}
                    onClick={() => setLightboxPhoto(photo)}
                  />
                  {photo.caption && <p className="gallery-photo-caption">{photo.caption}</p>}
                  {canManageGallery && (
                    <div className="activity-item-actions">
                      {deletePhotoConfirm === photo.id ? (
                        <>
                          <button
                            type="button"
                            className="activity-icon-btn activity-icon-confirm"
                            onClick={() => handleDeletePhoto(photo.id)}
                            title={content.exam_confirmDelete || "Confirmer"}
                          >
                            ✔
                          </button>
                          <button
                            type="button"
                            className="activity-icon-btn activity-icon-cancel"
                            onClick={() => setDeletePhotoConfirm(null)}
                            title={content.activity_cancel_button || "Annuler"}
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="activity-icon-btn activity-icon-delete"
                          onClick={() => setDeletePhotoConfirm(photo.id)}
                          title={content.outing_remove_button || "Remove"}
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {lightboxPhoto && (
        <div className="gallery-lightbox" onClick={() => setLightboxPhoto(null)}>
          <AuthImage url={lightboxPhoto.url} headers={headers} alt={lightboxPhoto.caption || ""} />
          {lightboxPhoto.caption && <p>{lightboxPhoto.caption}</p>}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
