import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap/dist/js/bootstrap.bundle'; 
import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap'

const Book = ({title, author, imgPath, summary, purchaseLinks, weekCount}) => {

    const [modal, displayModal] = useState(null);

    const closeModal = () => displayModal(false);
    const showModal = () => displayModal(true);

    return (
        <div className="row">
            <div className="col-8">
                <h3>{`${title}`}</h3>
                <p> <b> Weeks on List: </b> {weekCount === 0 ? "NEW" : weekCount} </p>
                <p> <b> Author(s): </b>{author}</p>
                {summary.length > 0 && <p> <b> Summary: </b> {summary} </p>}

                {purchaseLinks.length > 0 && 
                    <Button variant="outline-success" onClick={showModal}>
                        Purchase Here
                    </Button>                
                }
                <Modal show={modal} onHide={closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Purchase Links</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    {
                        purchaseLinks.map((link, index) => {
                            return (
                                <div key={`link-${index}`}>
                                    <a href={link.url} target="_blank" rel="noreferrer">{link.name}</a>
                                </div>
                            );
                        })
                    }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeModal}>
                        Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
            <div className="col-4 book-covers">
                <img className="cover" src={imgPath} alt={title} />
            </div>

        </div>
    );
}

export default Book;
