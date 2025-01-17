module Data.FareContract exposing
    ( FareContract
    , FareContractState(..)
    , FareTime
    , TravelRight(..)
    , TravelRightBase
    , TravelRightCarnet
    , TravelRightFull
    , UsedAccess
    )

import Data.PaymentType exposing (PaymentType)


type TravelRight
    = SingleTicket TravelRightFull
    | PeriodTicket TravelRightFull
    | CarnetTicket TravelRightCarnet
    | UnknownTicket TravelRightBase


type alias TravelRightFull =
    { id : String
    , status : Int
    , fareProductRef : String
    , startDateTime : FareTime
    , endDateTime : FareTime
    , usageValidityPeriodRef : String
    , userProfileRef : String
    , authorityRef : String
    , tariffZoneRefs : List String
    }


type alias TravelRightCarnet =
    { id : String
    , status : Int
    , fareProductRef : String
    , startDateTime : FareTime
    , endDateTime : FareTime
    , usageValidityPeriodRef : String
    , userProfileRef : String
    , authorityRef : String
    , tariffZoneRefs : List String
    , maximumNumberOfAccesses : Int
    , numberOfUsedAccesses : Int
    , usedAccesses : List UsedAccess
    }


type alias UsedAccess =
    { startDateTime : FareTime
    , endDateTime : FareTime
    }


type alias TravelRightBase =
    { id : String
    , status : Maybe Int
    }


type alias FareTime =
    { timestamp : Int
    , year : Int
    , month : Int
    , day : Int
    , hour : Int
    , minute : Int
    , second : Int
    }


type alias FareContract =
    { created : FareTime
    , version : String
    , orderId : String
    , minimumSecurityLevel : Int
    , id : String
    , travelRights : List TravelRight
    , state : FareContractState
    , qrCode : Maybe String
    , validFrom : Int
    , validTo : Int
    , totalAmount : Maybe String
    , paymentType : List PaymentType
    }


type FareContractState
    = FareContractStateUnspecified
    | FareContractStateNotActivated
    | FareContractStateActivated
    | FareContractStateCancelled
    | FareContractStateRefunded
