import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaPalette,
  FaShoppingCart,
  FaPaintBrush,
  FaFilePdf,
  FaEye,
  FaCheckCircle,
  FaPrint,
  FaTruck,
  FaArrowRight,
  FaClock,
  FaMapMarkerAlt,
  FaUndo,
} from 'react-icons/fa';

const steps = [
  {
    number: '01',
    icon: <FaPalette />,
    title: 'Choose Your Design',
    description:
      'Browse our collection of flex designs and select the design that best matches your event, celebration, business, or personal requirement.',
    status: 'Design Selected',
  },
  {
    number: '02',
    icon: <FaShoppingCart />,
    title: 'Place Your Order',
    description:
      'Enter your required size, quantity, customization details, contact information, and delivery address to place your order.',
    status: 'Order Placed',
  },
  {
    number: '03',
    icon: <FaPaintBrush />,
    title: 'Design Preparation',
    description:
      'Our team reviews your requirements and prepares the customized flex design according to the details you provided.',
    status: 'In Progress',
  },
  {
    number: '04',
    icon: <FaFilePdf />,
    title: 'Final Design Uploaded',
    description:
      'Once your design is prepared, our team uploads the final design file for you to review before printing.',
    status: 'Awaiting Approval',
  },
  {
    number: '05',
    icon: <FaEye />,
    title: 'Review & Approve',
    description:
      'View the final design carefully. If everything looks correct, approve it. If changes are required, you can request modifications.',
    status: 'Customer Review',
  },
  {
    number: '06',
    icon: <FaPrint />,
    title: 'Printing',
    description:
      'After your approval, the final design is sent for printing using the selected material and required specifications.',
    status: 'Printing',
  },
  {
    number: '07',
    icon: <FaCheckCircle />,
    title: 'Ready',
    description:
      'Your completed flex is checked and prepared for either delivery to your address or pickup from the studio.',
    status: 'Ready',
  },
  {
    number: '08',
    icon: <FaTruck />,
    title: 'Delivery / Pickup',
    description:
      'Your finished flex is delivered to the provided address or made available for pickup, completing your order.',
    status: 'Delivered',
  },
];

const statusFlow = [
  'pending',
  'confirmed',
  'in-progress',
  'awaiting-approval',
  'approved',
  'ready',
  'delivered',
];

const HowIt = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#faf9f5',
        color: '#6e1423',
        fontFamily:
          'Arial, Helvetica, sans-serif',
      }}
    >
      {/* HERO SECTION */}
      <section
        style={{
          background:
            'linear-gradient(135deg, #6e1423 0%, #6e1423 55%, #6e1423 100%)',
          padding: '80px 20px 90px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.12)',
            top: '-130px',
            right: '-80px',
          }}
        />

        <div
          style={{
            position: 'absolute',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.08)',
            bottom: '-300px',
            left: '-180px',
          }}
        />

        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '8px 18px',
              borderRadius: '30px',
              border:
                '1px solid rgba(255,255,255,0.25)',
              color: '#f1d78b',
              fontSize: '13px',
              fontWeight: '700',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginBottom: '22px',
            }}
          >
            Simple. Transparent. Reliable.
          </div>

          <h1
            style={{
              margin: '0 0 20px',
              color: '#ffffff',
              fontFamily:
                'Georgia, "Times New Roman", serif',
              fontSize:
                'clamp(38px, 6vw, 68px)',
              lineHeight: 1.1,
              fontWeight: '600',
            }}
          >
            How It Works
          </h1>

          <p
            style={{
              maxWidth: '760px',
              margin: '0 auto',
              color: 'rgba(255,255,255,0.86)',
              fontSize:
                'clamp(16px, 2vw, 19px)',
              lineHeight: 1.8,
            }}
          >
            From choosing your design to receiving your
            finished flex, we make the entire printing
            process simple and transparent.
          </p>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section
        style={{
          padding: '70px 20px 40px',
        }}
      >
        <div
          style={{
            maxWidth: '950px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              color: '#b28a32',
              fontSize: '13px',
              fontWeight: '700',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            Your Order Journey
          </span>

          <h2
            style={{
              margin: '12px 0 18px',
              fontFamily:
                'Georgia, "Times New Roman", serif',
              color: '#6e1423',
              fontSize:
                'clamp(28px, 4vw, 42px)',
              fontWeight: '600',
            }}
          >
            From Idea to Finished Flex
          </h2>

          <p
            style={{
              margin: '0 auto',
              maxWidth: '780px',
              color: '#68736b',
              lineHeight: 1.8,
              fontSize: '16px',
            }}
          >
            Every order follows a clear process. You
            provide your requirements, our team prepares
            the design, you review and approve it, and
            only then do we move forward with printing.
          </p>
        </div>
      </section>

      {/* PROCESS STEPS */}
      <section
        style={{
          padding: '40px 20px 90px',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}
        >
          {steps.map((step, index) => (
            <div
              key={step.number}
              style={{
                background: '#ffffff',
                border: '1px solid #e6e4dc',
                borderRadius: '18px',
                padding: '30px 26px',
                position: 'relative',
                boxShadow:
                  '0 8px 28px rgba(30, 55, 40, 0.06)',
                transition:
                  'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  'translateY(-5px)';
                e.currentTarget.style.boxShadow =
                  '0 14px 35px rgba(30, 55, 40, 0.11)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 8px 28px rgba(30, 55, 40, 0.06)';
              }}
            >
              {/* NUMBER */}
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '22px',
                  color: '#d8d5ca',
                  fontSize: '30px',
                  fontWeight: '700',
                }}
              >
                {step.number}
              </div>

              {/* ICON */}
              <div
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '15px',
                  background: '#edf4ee',
                  color: '#6e1423',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '23px',
                  marginBottom: '22px',
                }}
              >
                {step.icon}
              </div>

              <h3
                style={{
                  margin: '0 0 12px',
                  color: '#6e1423',
                  fontFamily:
                    'Georgia, "Times New Roman", serif',
                  fontSize: '23px',
                  fontWeight: '600',
                }}
              >
                {step.title}
              </h3>

              <p
                style={{
                  margin: '0 0 20px',
                  color: '#68736b',
                  fontSize: '14px',
                  lineHeight: 1.75,
                }}
              >
                {step.description}
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 12px',
                  borderRadius: '20px',
                  background: '#f6f3e9',
                  color: '#806323',
                  fontSize: '12px',
                  fontWeight: '700',
                }}
              >
                <FaClock size={11} />
                {step.status}
              </div>

              {/* CONNECTOR */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    display: 'none',
                  }}
                >
                  <FaArrowRight />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CUSTOMER APPROVAL SECTION */}
      <section
        style={{
          background: '#f0f3ed',
          padding: '75px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '1050px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '45px',
            alignItems: 'center',
          }}
        >
          <div>
            <span
              style={{
                color: '#b28a32',
                fontSize: '13px',
                fontWeight: '700',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              Your Approval Matters
            </span>

            <h2
              style={{
                margin: '12px 0 18px',
                color: '#6e1423',
                fontFamily:
                  'Georgia, "Times New Roman", serif',
                fontSize:
                  'clamp(28px, 4vw, 40px)',
                lineHeight: 1.2,
              }}
            >
              You See It Before We Print It
            </h2>

            <p
              style={{
                margin: 0,
                color: '#667168',
                lineHeight: 1.8,
                fontSize: '15px',
              }}
            >
              Before your flex goes into production, our
              team uploads the final design for your review.
              You can check the design and approve it before
              printing begins.
            </p>
          </div>

          {/* APPROVAL CARD */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '30px',
              boxShadow:
                '0 12px 35px rgba(30, 55, 40, 0.08)',
              border: '1px solid #e3e7df',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '22px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#8a938c',
                    marginBottom: '5px',
                  }}
                >
                  ORDER STATUS
                </div>

                <strong
                  style={{
                    color: '#6e1423',
                    fontSize: '18px',
                  }}
                >
                  Awaiting Approval
                </strong>
              </div>

              <div
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  background: '#edf4ee',
                  color: '#6e1423',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaEye />
              </div>
            </div>

            <div
              style={{
                border: '1px solid #e7e5dd',
                borderRadius: '12px',
                padding: '20px',
                background: '#faf9f5',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <FaFilePdf
                  style={{
                    color: '#b28a32',
                    fontSize: '25px',
                  }}
                />

                <div>
                  <strong
                    style={{
                      display: 'block',
                      color: '#6e1423',
                    }}
                  >
                    Final Design
                  </strong>

                  <span
                    style={{
                      color: '#8a938c',
                      fontSize: '12px',
                    }}
                  >
                    Your customized design
                  </span>
                </div>
              </div>

              <div
                style={{
                  height: '8px',
                  background: '#e5e8e3',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: '#6e1423',
                    borderRadius: '10px',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                style={{
                  flex: 1,
                  minWidth: '120px',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  background: '#6e1423',
                  color: '#ffffff',
                  fontWeight: '700',
                  cursor: 'default',
                }}
              >
                <FaCheckCircle
                  style={{
                    marginRight: '7px',
                  }}
                />
                Approve
              </button>

              <button
                type="button"
                style={{
                  flex: 1,
                  minWidth: '120px',
                  border: '1px solid #d6d8d3',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  background: '#ffffff',
                  color: '#49544c',
                  fontWeight: '700',
                  cursor: 'default',
                }}
              >
                <FaUndo
                  style={{
                    marginRight: '7px',
                  }}
                />
                Request Changes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ORDER STATUS FLOW */}
      <section
        style={{
          padding: '80px 20px',
          background: '#ffffff',
        }}
      >
        <div
          style={{
            maxWidth: '1050px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              color: '#b28a32',
              fontSize: '13px',
              fontWeight: '700',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
            }}
          >
            Order Tracking
          </span>

          <h2
            style={{
              margin: '12px 0 45px',
              color: '#6e1423',
              fontFamily:
                'Georgia, "Times New Roman", serif',
              fontSize:
                'clamp(28px, 4vw, 40px)',
            }}
          >
            Follow Your Order
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: '0',
              overflowX: 'auto',
              padding: '10px 5px 25px',
            }}
          >
            {statusFlow.map((status, index) => (
              <React.Fragment key={status}>
                <div
                  style={{
                    minWidth: '110px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background:
                        index === 0
                          ? '#6e1423'
                          : '#edf4ee',
                      color:
                        index === 0
                          ? '#ffffff'
                          : '#6e1423',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 10px',
                      fontWeight: '700',
                      border:
                        '2px solid #d9e3da',
                    }}
                  >
                    {index + 1}
                  </div>

                  <span
                    style={{
                      color: '#526057',
                      fontSize: '11px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {status
                      .replace(/-/g, ' ')
                      .replace(/\b\w/g, (c) =>
                        c.toUpperCase()
                      )}
                  </span>
                </div>

                {index <
                  statusFlow.length - 1 && (
                  <div
                    style={{
                      width: '55px',
                      height: '2px',
                      background: '#dce4dd',
                      marginTop: '20px',
                      flexShrink: 0,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* DELIVERY SECTION */}
      <section
        style={{
          padding: '70px 20px',
          background: '#6e1423',
        }}
      >
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '62px',
              height: '62px',
              borderRadius: '50%',
              background:
                'rgba(255,255,255,0.1)',
              color: '#f1d78b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 22px',
              fontSize: '25px',
            }}
          >
            <FaMapMarkerAlt />
          </div>

          <h2
            style={{
              margin: '0 0 16px',
              color: '#ffffff',
              fontFamily:
                'Georgia, "Times New Roman", serif',
              fontSize:
                'clamp(28px, 4vw, 42px)',
            }}
          >
            Ready for Delivery
          </h2>

          <p
            style={{
              maxWidth: '680px',
              margin: '0 auto',
              color: 'rgba(255,255,255,0.78)',
              lineHeight: 1.8,
              fontSize: '15px',
            }}
          >
            Once your approved design has been printed
            and prepared, your order will be delivered to
            the address provided during checkout or made
            ready for studio pickup.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: '70px 20px',
          background: '#faf9f5',
        }}
      >
        <div
          style={{
            maxWidth: '850px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              margin: '0 0 15px',
              color: '#6e1423',
              fontFamily:
                'Georgia, "Times New Roman", serif',
              fontSize:
                'clamp(28px, 4vw, 40px)',
            }}
          >
            Ready to Create Your Flex?
          </h2>

          <p
            style={{
              margin: '0 auto 28px',
              color: '#6d776f',
              lineHeight: 1.7,
              maxWidth: '620px',
            }}
          >
            Explore our designs and start your order
            today. Your design, your approval, your final
            flex.
          </p>

          <Link
            to="/catalogue"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              borderRadius: '30px',
              background: '#6e1423',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '14px',
              boxShadow:
                '0 8px 20px rgba(36, 86, 61, 0.2)',
            }}
          >
            Explore Designs
            <FaArrowRight size={13} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HowIt;